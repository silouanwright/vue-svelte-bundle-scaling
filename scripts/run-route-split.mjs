import {
  brotliCompressSync,
  constants as zlibConstants,
  gzipSync,
} from "node:zlib";
import { mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";

import { svelte } from "@sveltejs/vite-plugin-svelte";
import vue from "@vitejs/plugin-vue";
import { build } from "vite";

const benchmarkRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const workRoot = join(benchmarkRoot, ".work-route-split");
const packageJson = JSON.parse(
  await readFile(join(benchmarkRoot, "package.json"), "utf8"),
);
const componentCounts = [0, 8, 16, 32, 64, 128, 256, 512];
const componentsPerRoute = 8;
const frameworks = ["vue", "svelte"];

function assertGeneratedPath(target) {
  const relativeTarget = relative(workRoot, target);
  if (
    relativeTarget === "" ||
    relativeTarget.startsWith("..") ||
    relativeTarget.includes("../")
  ) {
    throw new Error(`Refusing to modify non-generated path: ${target}`);
  }
}

async function writeGenerated(target, contents) {
  assertGeneratedPath(target);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, contents);
}

function vueComponent(family, index) {
  const seed = index + 1;
  const components = [
    `<script setup>
import { computed, ref } from "vue";
const count = ref(${seed});
const doubled = computed(() => count.value * 2);
</script>
<template>
  <article class="counter-card">
    <h3>Counter ${index}</h3>
    <button type="button" @click="count--">−</button>
    <output>{{ count }} / {{ doubled }}</output>
    <button type="button" @click="count++">+</button>
    <p v-if="count % 2 === 0">Even value</p>
  </article>
</template>`,
    `<script setup>
import { ref } from "vue";
const open = ref(${index % 2 === 0});
</script>
<template>
  <article class="disclosure-card">
    <button type="button" :aria-expanded="open" @click="open = !open">
      Details ${index}
    </button>
    <div v-if="open"><p>Expanded explanation ${seed}</p><a href="#details">Read more</a></div>
  </article>
</template>`,
    `<script setup>
import { ref } from "vue";
const tabs = ["Summary ${seed}", "Activity ${seed}", "Files ${seed}"];
const active = ref(tabs[0]);
</script>
<template>
  <article class="tabs-card">
    <nav aria-label="Panels">
      <button v-for="tab in tabs" :key="tab" :aria-pressed="active === tab" @click="active = tab">
        {{ tab }}
      </button>
    </nav>
    <section>{{ active }} content</section>
  </article>
</template>`,
    `<script setup>
import { computed, ref } from "vue";
const tasks = ref([
  { id: ${seed * 10 + 1}, label: "Collect ${seed}", done: true },
  { id: ${seed * 10 + 2}, label: "Process ${seed}", done: false },
  { id: ${seed * 10 + 3}, label: "Publish ${seed}", done: false },
]);
const completed = computed(() => tasks.value.filter((task) => task.done).length);
</script>
<template>
  <article class="tracker-card">
    <h3>{{ completed }} of {{ tasks.length }} complete</h3>
    <label v-for="task in tasks" :key="task.id">
      <input v-model="task.done" type="checkbox" /> {{ task.label }}
    </label>
  </article>
</template>`,
    `<script setup>
import { computed, ref } from "vue";
const query = ref("");
const records = ["Alpha ${seed}", "Beta ${seed}", "Gamma ${seed}", "Delta ${seed}"];
const matches = computed(() => records.filter((record) => record.toLowerCase().includes(query.value.toLowerCase())));
</script>
<template>
  <article class="search-card">
    <label>Search <input v-model="query" type="search" /></label>
    <ul v-if="matches.length"><li v-for="record in matches" :key="record">{{ record }}</li></ul>
    <p v-else>No matches</p>
  </article>
</template>`,
    `<script setup>
import { computed, ref } from "vue";
const name = ref("Workspace ${seed}");
const density = ref("comfortable");
const alerts = ref(true);
const valid = computed(() => name.value.trim().length >= 3);
function save() {}
</script>
<template>
  <form class="settings-card" @submit.prevent="save">
    <label>Name <input v-model="name" /></label>
    <label>Density <select v-model="density"><option>compact</option><option>comfortable</option></select></label>
    <label><input v-model="alerts" type="checkbox" /> Alerts</label>
    <button :disabled="!valid">Save settings</button>
  </form>
</template>`,
    `<script setup>
import { computed, ref } from "vue";
const page = ref(${(index % 5) + 1});
const total = ${seed + 8};
const label = computed(() => \`Page \${page.value} of \${total}\`);
</script>
<template>
  <article class="pagination-card">
    <button :disabled="page === 1" @click="page--">Previous</button>
    <output>{{ label }}</output>
    <button :disabled="page === total" @click="page++">Next</button>
  </article>
</template>`,
    `<script setup>
import { ref } from "vue";
const notices = ref([
  { id: ${seed * 10 + 1}, text: "Indexed ${seed} files", level: "success" },
  { id: ${seed * 10 + 2}, text: "Review item ${seed}", level: "warning" },
]);
function dismiss(id) {
  notices.value = notices.value.filter((notice) => notice.id !== id);
}
</script>
<template>
  <aside class="notices-card" aria-live="polite">
    <article v-for="notice in notices" :key="notice.id" :class="notice.level">
      <span>{{ notice.text }}</span><button @click="dismiss(notice.id)">Dismiss</button>
    </article>
    <p v-if="!notices.length">All caught up</p>
  </aside>
</template>`,
  ];
  return components[family];
}

function svelteComponent(family, index) {
  const seed = index + 1;
  const components = [
    `<script>
  let count = $state(${seed});
  let doubled = $derived(count * 2);
</script>
<article class="counter-card">
  <h3>Counter ${index}</h3>
  <button type="button" onclick={() => count--}>−</button>
  <output>{count} / {doubled}</output>
  <button type="button" onclick={() => count++}>+</button>
  {#if count % 2 === 0}<p>Even value</p>{/if}
</article>`,
    `<script>
  let open = $state(${index % 2 === 0});
</script>
<article class="disclosure-card">
  <button type="button" aria-expanded={open} onclick={() => (open = !open)}>Details ${index}</button>
  {#if open}<div><p>Expanded explanation ${seed}</p><a href="#details">Read more</a></div>{/if}
</article>`,
    `<script>
  const tabs = ["Summary ${seed}", "Activity ${seed}", "Files ${seed}"];
  let active = $state(tabs[0]);
</script>
<article class="tabs-card">
  <nav aria-label="Panels">
    {#each tabs as tab (tab)}
      <button aria-pressed={active === tab} onclick={() => (active = tab)}>{tab}</button>
    {/each}
  </nav>
  <section>{active} content</section>
</article>`,
    `<script>
  let tasks = $state([
    { id: ${seed * 10 + 1}, label: "Collect ${seed}", done: true },
    { id: ${seed * 10 + 2}, label: "Process ${seed}", done: false },
    { id: ${seed * 10 + 3}, label: "Publish ${seed}", done: false },
  ]);
  let completed = $derived(tasks.filter((task) => task.done).length);
</script>
<article class="tracker-card">
  <h3>{completed} of {tasks.length} complete</h3>
  {#each tasks as task (task.id)}
    <label><input bind:checked={task.done} type="checkbox" /> {task.label}</label>
  {/each}
</article>`,
    `<script>
  let query = $state("");
  const records = ["Alpha ${seed}", "Beta ${seed}", "Gamma ${seed}", "Delta ${seed}"];
  let matches = $derived(records.filter((record) => record.toLowerCase().includes(query.toLowerCase())));
</script>
<article class="search-card">
  <label>Search <input bind:value={query} type="search" /></label>
  {#if matches.length}
    <ul>{#each matches as record (record)}<li>{record}</li>{/each}</ul>
  {:else}<p>No matches</p>{/if}
</article>`,
    `<script>
  let name = $state("Workspace ${seed}");
  let density = $state("comfortable");
  let alerts = $state(true);
  let valid = $derived(name.trim().length >= 3);
  function save(event) { event.preventDefault(); }
</script>
<form class="settings-card" onsubmit={save}>
  <label>Name <input bind:value={name} /></label>
  <label>Density <select bind:value={density}><option>compact</option><option>comfortable</option></select></label>
  <label><input bind:checked={alerts} type="checkbox" /> Alerts</label>
  <button disabled={!valid}>Save settings</button>
</form>`,
    `<script>
  let page = $state(${(index % 5) + 1});
  const total = ${seed + 8};
  let label = $derived(\`Page \${page} of \${total}\`);
</script>
<article class="pagination-card">
  <button disabled={page === 1} onclick={() => page--}>Previous</button>
  <output>{label}</output>
  <button disabled={page === total} onclick={() => page++}>Next</button>
</article>`,
    `<script>
  let notices = $state([
    { id: ${seed * 10 + 1}, text: "Indexed ${seed} files", level: "success" },
    { id: ${seed * 10 + 2}, text: "Review item ${seed}", level: "warning" },
  ]);
  function dismiss(id) {
    notices = notices.filter((notice) => notice.id !== id);
  }
</script>
<aside class="notices-card" aria-live="polite">
  {#each notices as notice (notice.id)}
    <article class={notice.level}><span>{notice.text}</span><button onclick={() => dismiss(notice.id)}>Dismiss</button></article>
  {/each}
  {#if !notices.length}<p>All caught up</p>{/if}
</aside>`,
  ];
  return components[family];
}

function routeSource(framework, routeIndex) {
  const extension = framework === "vue" ? "vue" : "svelte";
  const firstComponent = routeIndex * componentsPerRoute;
  const imports = Array.from({ length: componentsPerRoute }, (_, offset) => {
    const index = firstComponent + offset;
    return `import Component${index} from "../components/Component${index}.${extension}";`;
  }).join("\n");
  const instances = Array.from(
    { length: componentsPerRoute },
    (_, offset) => `    <Component${firstComponent + offset} />`,
  ).join("\n");

  if (framework === "vue") {
    return `<script setup>
${imports}
</script>
<template>
  <section data-route="${routeIndex}">
    <h2>Route ${routeIndex}</h2>
${instances}
  </section>
</template>
`;
  }
  return `<script>
  ${imports.replaceAll("\n", "\n  ")}
</script>
<section data-route="${routeIndex}">
  <h2>Route ${routeIndex}</h2>
${instances}
</section>
`;
}

function appSource(framework, routeCount) {
  const extension = framework === "vue" ? "vue" : "svelte";
  const loaders = Array.from(
    { length: routeCount },
    (_, index) => `() => import("./routes/Route${index}.${extension}")`,
  ).join(",\n  ");

  if (framework === "vue") {
    return `<script setup>
import { shallowRef } from "vue";
const routes = [
  ${loaders}
];
const CurrentRoute = shallowRef(null);
async function openRoute(loader) {
  CurrentRoute.value = (await loader()).default;
}
</script>
<template>
  <main>
    <h1>Route-split bundle benchmark</h1>
    <nav>
      <button v-for="(loader, index) in routes" :key="index" @click="openRoute(loader)">
        Route {{ index }}
      </button>
    </nav>
    <component :is="CurrentRoute" v-if="CurrentRoute" />
  </main>
</template>
`;
  }
  return `<script>
  const routes = [
    ${loaders}
  ];
  let CurrentRoute = $state();
  async function openRoute(loader) {
    CurrentRoute = (await loader()).default;
  }
</script>
<main>
  <h1>Route-split bundle benchmark</h1>
  <nav>
    {#each routes as loader, index}
      <button onclick={() => openRoute(loader)}>Route {index}</button>
    {/each}
  </nav>
  {#if CurrentRoute}<CurrentRoute />{/if}
</main>
`;
}

async function generateCase(framework, count) {
  const caseRoot = join(workRoot, `${framework}-${count}`);
  assertGeneratedPath(caseRoot);
  await rm(caseRoot, { recursive: true, force: true });
  await mkdir(join(caseRoot, "src", "components"), { recursive: true });
  await mkdir(join(caseRoot, "src", "routes"), { recursive: true });

  const extension = framework === "vue" ? "vue" : "svelte";
  const routeCount = count / componentsPerRoute;
  await writeGenerated(
    join(caseRoot, "src", `App.${extension}`),
    appSource(framework, routeCount),
  );
  for (let index = 0; index < count; index += 1) {
    await writeGenerated(
      join(caseRoot, "src", "components", `Component${index}.${extension}`),
      framework === "vue"
        ? vueComponent(index % componentsPerRoute, index)
        : svelteComponent(index % componentsPerRoute, index),
    );
  }
  for (let index = 0; index < routeCount; index += 1) {
    await writeGenerated(
      join(caseRoot, "src", "routes", `Route${index}.${extension}`),
      routeSource(framework, index),
    );
  }

  const entry =
    framework === "vue"
      ? `import { createApp } from "vue";\nimport App from "./App.vue";\ncreateApp(App).mount("#app");\n`
      : `import { mount } from "svelte";\nimport App from "./App.svelte";\nmount(App, { target: document.querySelector("#app") });\n`;
  await writeGenerated(join(caseRoot, "src", "main.js"), entry);
  await writeGenerated(
    join(caseRoot, "index.html"),
    `<!doctype html><html lang="en"><head><meta charset="UTF-8"><title>Route split</title></head><body><div id="app"></div><script type="module" src="/src/main.js"></script></body></html>`,
  );
  return caseRoot;
}

async function listMatchingFiles(root, pattern) {
  const files = [];
  async function visit(directory) {
    for (const entry of await readdir(directory)) {
      const target = join(directory, entry);
      const targetStat = await stat(target);
      if (targetStat.isDirectory()) await visit(target);
      else if (pattern.test(entry)) files.push(target);
    }
  }
  await visit(root);
  return files.sort();
}

function listJavaScriptFiles(root) {
  return listMatchingFiles(root, /\.(?:m?js)$/);
}

function listSourceFiles(root) {
  return listMatchingFiles(root, /\.(?:js|svelte|vue)$/);
}

async function measureSource(root) {
  const files = await listSourceFiles(root);
  let bytes = 0;
  let nonblankLines = 0;
  for (const filename of files) {
    const contents = await readFile(filename, "utf8");
    bytes += Buffer.byteLength(contents);
    nonblankLines += contents
      .split("\n")
      .filter((line) => line.trim().length > 0).length;
  }
  return { files: files.length, bytes, nonblankLines };
}

function compressedSizes(buffer) {
  return {
    raw: buffer.byteLength,
    gzip: gzipSync(buffer, { level: 9 }).byteLength,
    brotli: brotliCompressSync(buffer, {
      params: { [zlibConstants.BROTLI_PARAM_QUALITY]: 11 },
    }).byteLength,
  };
}

async function measureCase(framework, count) {
  const caseRoot = await generateCase(framework, count);
  const source = await measureSource(join(caseRoot, "src"));
  const outDir = join(caseRoot, "dist");
  await build({
    root: caseRoot,
    configFile: false,
    logLevel: "error",
    plugins:
      framework === "vue"
        ? [vue()]
        : [svelte({ compilerOptions: { dev: false } })],
    build: {
      target: "es2022",
      minify: "oxc",
      sourcemap: false,
      reportCompressedSize: false,
      emptyOutDir: true,
      outDir,
    },
  });

  const buffers = [];
  const files = [];
  const chunked = { raw: 0, gzip: 0, brotli: 0 };
  for (const filename of await listJavaScriptFiles(outDir)) {
    const buffer = await readFile(filename);
    const fileSizes = compressedSizes(buffer);
    buffers.push(buffer);
    files.push({ file: relative(outDir, filename), ...fileSizes });
    for (const metric of Object.keys(chunked)) chunked[metric] += fileSizes[metric];
  }
  const coalesced = compressedSizes(Buffer.concat(buffers));
  return {
    framework,
    count,
    routes: count / componentsPerRoute,
    jsFiles: files.length,
    source,
    files,
    chunked,
    coalesced,
  };
}

function sampledCrossover(vuePoints, sveltePoints, selector) {
  for (let index = 1; index < vuePoints.length; index += 1) {
    const previousDelta =
      selector(vuePoints[index - 1]) - selector(sveltePoints[index - 1]);
    const currentDelta =
      selector(vuePoints[index]) - selector(sveltePoints[index]);
    if (previousDelta > 0 && currentDelta <= 0) {
      const previousCount = vuePoints[index - 1].count;
      const currentCount = vuePoints[index].count;
      return (
        previousCount +
        (currentCount - previousCount) *
          (previousDelta / (previousDelta - currentDelta))
      );
    }
  }
  return null;
}

function bytes(value) {
  return `${value.toLocaleString("en-US")} B`;
}

function crossover(value) {
  return value === null ? "none sampled" : `≈ ${value.toFixed(1)}`;
}

function report(results, metadata) {
  const vuePoints = results.filter((result) => result.framework === "vue");
  const sveltePoints = results.filter((result) => result.framework === "svelte");
  const lines = [
    "# Heterogeneous Route-Split Bundle Results",
    "",
    `Generated: ${metadata.generatedAt}`,
    "",
    `- Vue: ${metadata.versions.vue}`,
    `- Svelte: ${metadata.versions.svelte}`,
    `- Vite: ${metadata.versions.vite}`,
    `- Component families: ${metadata.componentFamilies}`,
    `- Components per lazy route: ${metadata.componentsPerRoute}`,
    "- Chunked sizes sum gzip/Brotli for each emitted JavaScript file",
    "  independently, matching how route chunks are transferred.",
    "",
    "## Independently compressed route chunks",
    "",
    "| Components | Routes | Vue Brotli | Svelte Brotli | Vue − Svelte |",
    "| ---: | ---: | ---: | ---: | ---: |",
  ];
  for (let index = 0; index < vuePoints.length; index += 1) {
    const vuePoint = vuePoints[index];
    const sveltePoint = sveltePoints[index];
    const delta = vuePoint.chunked.brotli - sveltePoint.chunked.brotli;
    lines.push(
      `| ${vuePoint.count} | ${vuePoint.routes} | ${bytes(vuePoint.chunked.brotli)} | ${bytes(sveltePoint.chunked.brotli)} | ${delta >= 0 ? "+" : ""}${bytes(delta)} |`,
    );
  }

  lines.push(
    "",
    "## Matched source scale",
    "",
    "| Components | Vue nonblank lines | Svelte nonblank lines | Vue source | Svelte source |",
    "| ---: | ---: | ---: | ---: | ---: |",
  );
  for (let index = 0; index < vuePoints.length; index += 1) {
    const vuePoint = vuePoints[index];
    const sveltePoint = sveltePoints[index];
    lines.push(
      `| ${vuePoint.count} | ${vuePoint.source.nonblankLines.toLocaleString("en-US")} | ${sveltePoint.source.nonblankLines.toLocaleString("en-US")} | ${bytes(vuePoint.source.bytes)} | ${bytes(sveltePoint.source.bytes)} |`,
    );
  }

  lines.push(
    "",
    "## Crossover summary",
    "",
    "| Metric | Independently compressed chunks | One coalesced bundle |",
    "| --- | ---: | ---: |",
  );
  for (const metric of ["raw", "gzip", "brotli"]) {
    lines.push(
      `| ${metric} | ${crossover(sampledCrossover(vuePoints, sveltePoints, (point) => point.chunked[metric]))} | ${crossover(sampledCrossover(vuePoints, sveltePoints, (point) => point.coalesced[metric]))} |`,
    );
  }
  const lastVue = vuePoints.at(-1);
  const lastSvelte = sveltePoints.at(-1);
  lines.push(
    "",
    `At ${lastVue.count} components, independently compressed Brotli output was`,
    `${bytes(lastVue.chunked.brotli)} for Vue and ${bytes(lastSvelte.chunked.brotli)} for Svelte.`,
    `The same emitted files compressed as one artificial stream were ${bytes(lastVue.coalesced.brotli)}`,
    `for Vue and ${bytes(lastSvelte.coalesced.brotli)} for Svelte.`,
    "",
    "This benchmark reduces structural repetition and prevents Brotli from sharing",
    "a dictionary across lazy route boundaries. It remains generated code, not a",
    "substitute for porting a representative production slice.",
    "",
  );
  return `${lines.join("\n").trimEnd()}\n`;
}

async function main() {
  await rm(workRoot, { recursive: true, force: true });
  await mkdir(workRoot, { recursive: true });
  const results = [];
  for (const count of componentCounts) {
    for (const framework of frameworks) {
      results.push(await measureCase(framework, count));
      globalThis.gc?.();
      process.stdout.write(`Measured ${framework} at ${count} components\n`);
    }
  }
  const metadata = {
    generatedAt: new Date().toISOString(),
    node: process.version,
    componentCounts,
    componentFamilies: componentsPerRoute,
    componentsPerRoute,
    versions: {
      vite: packageJson.dependencies.vite,
      vue: packageJson.dependencies.vue,
      svelte: packageJson.dependencies.svelte,
      vuePlugin: packageJson.dependencies["@vitejs/plugin-vue"],
      sveltePlugin:
        packageJson.dependencies["@sveltejs/vite-plugin-svelte"],
    },
  };
  await writeFile(
    join(benchmarkRoot, "route-split.json"),
    `${JSON.stringify({ metadata, results }, null, 2)}\n`,
  );
  await writeFile(
    join(benchmarkRoot, "route-split.md"),
    report(results, metadata),
  );
  await rm(workRoot, { recursive: true, force: true });
}

await main();
