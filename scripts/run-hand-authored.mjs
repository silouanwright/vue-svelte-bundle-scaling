import {
  brotliCompressSync,
  constants as zlibConstants,
  gzipSync,
} from "node:zlib";
import {
  cp,
  mkdir,
  readFile,
  readdir,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { svelte } from "@sveltejs/vite-plugin-svelte";
import vue from "@vitejs/plugin-vue";
import { build } from "vite";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const fixtureRoot = join(root, "fixtures", "hand-authored");
const workRoot = join(root, ".work-hand-authored");
const packageJson = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
const trimmed = process.argv.includes("--trimmed");
const profile = trimmed ? "trimmed" : "default";
const routeCounts = [1, 2, 4, 8];
const frameworks = ["vue", "svelte"];
const routeNames = [
  "Dashboard",
  "Search",
  "Records",
  "Reader",
  "Editor",
  "Settings",
  "Notifications",
  "Library",
];

function assertWorkPath(target) {
  const path = relative(workRoot, target);
  if (!path || path.startsWith("..") || path.includes("../")) {
    throw new Error(`Refusing generated write outside work root: ${target}`);
  }
}

async function writeGenerated(target, source) {
  assertWorkPath(target);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, source);
}

function appSource(framework, routeCount) {
  const selected = routeNames.slice(0, routeCount);
  const extension = framework === "vue" ? "vue" : "svelte";
  const lazy = selected.slice(1).map(
    (name) =>
      `{ id: "${name.toLowerCase()}", label: "${name}", load: () => import("./routes/${name}Route.${extension}").then((module) => module.default) }`,
  );

  if (framework === "vue") {
    return `<script setup>
import { markRaw, shallowRef } from "vue";
import DashboardRoute from "./routes/DashboardRoute.vue";
const routes = [
  { id: "dashboard", label: "Dashboard", load: async () => DashboardRoute }${lazy.length ? `,\n  ${lazy.join(",\n  ")}` : ""}
];
const currentId = shallowRef("dashboard");
const CurrentRoute = shallowRef(markRaw(DashboardRoute));
async function openRoute(route) {
  currentId.value = route.id;
  CurrentRoute.value = markRaw(await route.load());
}
</script>
<template>
  <div class="app-shell">
    <nav class="app-nav" aria-label="Application routes">
      <h1>Research Workspace</h1>
      <button v-for="route in routes" :key="route.id" :aria-current="currentId === route.id ? 'page' : undefined" @click="openRoute(route)">{{ route.label }}</button>
    </nav>
    <main class="workspace"><component :is="CurrentRoute" /></main>
  </div>
</template>
`;
  }

  return `<script>
  import DashboardRoute from "./routes/DashboardRoute.svelte";
  const routes = [
    { id: "dashboard", label: "Dashboard", load: async () => DashboardRoute }${lazy.length ? `,\n    ${lazy.join(",\n    ")}` : ""}
  ];
  let currentId = $state("dashboard");
  let CurrentRoute = $state(DashboardRoute);
  async function openRoute(route) {
    currentId = route.id;
    CurrentRoute = await route.load();
  }
</script>
<div class="app-shell">
  <nav class="app-nav" aria-label="Application routes">
    <h1>Research Workspace</h1>
    {#each routes as route (route.id)}
      <button aria-current={currentId === route.id ? "page" : undefined} onclick={() => openRoute(route)}>{route.label}</button>
    {/each}
  </nav>
  <main class="workspace"><CurrentRoute /></main>
</div>
`;
}

async function prepareCase(framework, routeCount) {
  const caseRoot = join(workRoot, `${framework}-${routeCount}`);
  assertWorkPath(caseRoot);
  await rm(caseRoot, { recursive: true, force: true });
  await cp(join(fixtureRoot, framework), caseRoot, { recursive: true });
  await cp(join(fixtureRoot, "shared"), join(caseRoot, "shared"), {
    recursive: true,
  });
  const extension = framework === "vue" ? "vue" : "svelte";
  await writeGenerated(
    join(caseRoot, "src", `App.${extension}`),
    appSource(framework, routeCount),
  );
  return caseRoot;
}

async function listJavaScriptFiles(directory) {
  const files = [];
  async function visit(current) {
    for (const entry of await readdir(current)) {
      const target = join(current, entry);
      const info = await stat(target);
      if (info.isDirectory()) await visit(target);
      else if (/\.(?:m?js)$/.test(entry)) files.push(target);
    }
  }
  await visit(directory);
  return files.sort();
}

function sizes(buffer) {
  return {
    raw: buffer.byteLength,
    gzip: gzipSync(buffer, { level: 9 }).byteLength,
    brotli: brotliCompressSync(buffer, {
      params: { [zlibConstants.BROTLI_PARAM_QUALITY]: 11 },
    }).byteLength,
  };
}

function add(target, source) {
  for (const metric of ["raw", "gzip", "brotli"]) target[metric] += source[metric];
}

async function measure(framework, routeCount) {
  const caseRoot = await prepareCase(framework, routeCount);
  const outDir = join(caseRoot, "dist");
  await build({
    root: caseRoot,
    configFile: false,
    logLevel: "error",
    resolve: { alias: { "@shared": join(caseRoot, "shared") } },
    plugins:
      framework === "vue"
        ? [vue(trimmed ? { features: { optionsAPI: false } } : {})]
        : [
            svelte(
              trimmed
                ? { compilerOptions: { discloseVersion: false } }
                : {},
            ),
          ],
    build: {
      target: "es2022",
      minify: "oxc",
      sourcemap: false,
      reportCompressedSize: false,
      manifest: true,
      emptyOutDir: true,
      outDir,
    },
  });

  const manifest = JSON.parse(
    await readFile(join(outDir, ".vite", "manifest.json"), "utf8"),
  );
  const entry = Object.values(manifest).find((item) => item.isEntry);
  if (!entry) throw new Error("Vite manifest did not contain an entry chunk");

  const initialFiles = new Set();
  function collectInitial(item) {
    if (!item || initialFiles.has(item.file)) return;
    initialFiles.add(item.file);
    for (const imported of item.imports ?? []) collectInitial(manifest[imported]);
  }
  collectInitial(entry);

  const files = [];
  const complete = { raw: 0, gzip: 0, brotli: 0 };
  const initial = { raw: 0, gzip: 0, brotli: 0 };
  const buffers = [];
  for (const filename of await listJavaScriptFiles(outDir)) {
    const buffer = await readFile(filename);
    const file = relative(outDir, filename);
    const fileSizes = sizes(buffer);
    const isInitial = initialFiles.has(file);
    files.push({ file, initial: isInitial, ...fileSizes });
    buffers.push(buffer);
    add(complete, fileSizes);
    if (isInitial) add(initial, fileSizes);
  }

  return {
    framework,
    routes: routeCount,
    componentDefinitions: routeCount * 4 + 1,
    jsFiles: files.length,
    files,
    initial,
    complete,
    coalesced: sizes(Buffer.concat(buffers)),
  };
}

function bytes(value) {
  return `${value.toLocaleString("en-US")} B`;
}

function report(results, metadata) {
  const lines = [
    `# Hand-Authored Application Results${trimmed ? " — Trimmed Production Profile" : ""}`,
    "",
    `Generated: ${metadata.generatedAt}`,
    "",
    `- Vue: ${metadata.versions.vue}`,
    `- Svelte: ${metadata.versions.svelte}`,
    `- Vite: ${metadata.versions.vite}`,
    `- Framework profile: ${metadata.profile}`,
    "- Workload: eight feature routes, three independently authored leaf components per route",
    "- Compression: gzip level 9 and Brotli quality 11, applied to every JavaScript response independently",
    "",
    "## Complete cold traversal",
    "",
    "| Routes | Component definitions | Vue Brotli | Svelte Brotli | Vue − Svelte |",
    "| ---: | ---: | ---: | ---: | ---: |",
  ];
  for (const routes of routeCounts) {
    const vueResult = results.find((item) => item.framework === "vue" && item.routes === routes);
    const svelteResult = results.find((item) => item.framework === "svelte" && item.routes === routes);
    const delta = vueResult.complete.brotli - svelteResult.complete.brotli;
    lines.push(`| ${routes} | ${vueResult.componentDefinitions} | ${bytes(vueResult.complete.brotli)} | ${bytes(svelteResult.complete.brotli)} | ${delta >= 0 ? "+" : ""}${bytes(delta)} |`);
  }
  lines.push(
    "",
    "## Full eight-route application",
    "",
    "| Metric | Vue | Svelte | Vue − Svelte |",
    "| --- | ---: | ---: | ---: |",
  );
  const vueFull = results.find((item) => item.framework === "vue" && item.routes === 8);
  const svelteFull = results.find((item) => item.framework === "svelte" && item.routes === 8);
  for (const metric of ["raw", "gzip", "brotli"]) {
    const delta = vueFull.complete[metric] - svelteFull.complete[metric];
    const label = metric === "brotli" ? "Brotli" : metric;
    lines.push(`| Complete ${label} | ${bytes(vueFull.complete[metric])} | ${bytes(svelteFull.complete[metric])} | ${delta >= 0 ? "+" : ""}${bytes(delta)} |`);
  }
  for (const metric of ["gzip", "brotli"]) {
    const delta = vueFull.initial[metric] - svelteFull.initial[metric];
    const label = metric === "brotli" ? "Brotli" : metric;
    lines.push(`| Initial ${label} | ${bytes(vueFull.initial[metric])} | ${bytes(svelteFull.initial[metric])} | ${delta >= 0 ? "+" : ""}${bytes(delta)} |`);
  }
  lines.push(
    "",
    "## Full-application lazy route responses",
    "",
    "| Route | Vue Brotli | Svelte Brotli | Vue − Svelte |",
    "| --- | ---: | ---: | ---: |",
  );
  for (const route of routeNames.slice(1)) {
    const vueChunk = vueFull.files.find((file) => file.file.includes(`${route}Route-`));
    const svelteChunk = svelteFull.files.find((file) => file.file.includes(`${route}Route-`));
    if (!vueChunk || !svelteChunk) {
      throw new Error(`Missing lazy chunk for ${route}`);
    }
    const delta = vueChunk.brotli - svelteChunk.brotli;
    lines.push(`| ${route} | ${bytes(vueChunk.brotli)} | ${bytes(svelteChunk.brotli)} | ${delta >= 0 ? "+" : ""}${bytes(delta)} |`);
  }
  lines.push(
    "",
    "## Compression diagnostic",
    "",
    "| Metric | Vue | Svelte |",
    "| --- | ---: | ---: |",
    `| Per-response Brotli / raw | ${(vueFull.complete.brotli / vueFull.complete.raw * 100).toFixed(1)}% | ${(svelteFull.complete.brotli / svelteFull.complete.raw * 100).toFixed(1)}% |`,
    `| Coalesced Brotli / raw | ${(vueFull.coalesced.brotli / vueFull.coalesced.raw * 100).toFixed(1)}% | ${(svelteFull.coalesced.brotli / svelteFull.coalesced.raw * 100).toFixed(1)}% |`,
    `| Coalesced Brotli | ${bytes(vueFull.coalesced.brotli)} | ${bytes(svelteFull.coalesced.brotli)} |`,
    "",
    "The complete total counts every emitted JavaScript response once, matching a cold traversal of every route.",
    "The initial total includes only the entry and its static imports. Coalesced sizes remain available in the JSON",
    "as a repetition diagnostic; they are not presented as network transfer.",
    "All seven Vue lazy route responses are smaller after Brotli in this build, but Svelte's smaller initial entry",
    "keeps the complete 33-definition application smaller overall. Chunk allocation remains bundler-dependent.",
    "Unlike the clone-heavy 640-Todo workload, this application does not compress to a single-digit percentage",
    "of raw JavaScript. The coalesced row quantifies the dictionary sharing lost across route responses.",
    "",
    "This workload is hand-authored and structurally varied, but it remains one small application with no third-party",
    "product dependencies. It does not establish a universal component-count crossover.",
    "",
  );
  return `${lines.join("\n").trimEnd()}\n`;
}

await rm(workRoot, { recursive: true, force: true });
await mkdir(workRoot, { recursive: true });
const results = [];
for (const routes of routeCounts) {
  for (const framework of frameworks) {
    results.push(await measure(framework, routes));
    globalThis.gc?.();
    process.stdout.write(`Measured ${framework} with ${routes} routes\n`);
  }
}
const metadata = {
  generatedAt: new Date().toISOString(),
  node: process.version,
  routeCounts,
  routeNames,
  compression: { gzipLevel: 9, brotliQuality: 11 },
  profile,
  frameworkOptions: trimmed
    ? {
        vue: { optionsAPI: false },
        svelte: { discloseVersion: false },
      }
    : {
        vue: "official plugin defaults",
        svelte: "official plugin defaults",
      },
  versions: {
    vite: packageJson.dependencies.vite,
    vue: packageJson.dependencies.vue,
    svelte: packageJson.dependencies.svelte,
  },
};
const outputStem = trimmed ? "hand-authored-trimmed" : "hand-authored";
await writeFile(
  join(root, "results", `${outputStem}.json`),
  `${JSON.stringify({ metadata, results }, null, 2)}\n`,
);
await writeFile(
  join(root, "results", `${outputStem}.md`),
  report(results, metadata),
);
await rm(workRoot, { recursive: true, force: true });
