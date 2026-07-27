import {
  brotliCompressSync,
  constants as zlibConstants,
  gzipSync,
} from "node:zlib";
import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";

import { svelte } from "@sveltejs/vite-plugin-svelte";
import vue from "@vitejs/plugin-vue";
import { build } from "vite";

const benchmarkRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const workRoot = join(benchmarkRoot, ".work-original");
const originalCommit = "7bb60ff681a3f5016e8af26084e72100cd37a876";
const originalBaseUrl =
  `https://raw.githubusercontent.com/yyx990803/vue-svelte-size-analysis/${originalCommit}`;
const packageJson = JSON.parse(
  await readFile(join(benchmarkRoot, "package.json"), "utf8"),
);

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

async function fetchSource(filename) {
  const url = `${originalBaseUrl}/${filename}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Unable to fetch ${url}: ${response.status}`);
  }
  const source = await response.text();
  return {
    source,
    url,
    sha256: createHash("sha256").update(source).digest("hex"),
  };
}

async function listJavaScriptFiles(root) {
  const files = [];

  async function visit(directory) {
    for (const entry of await readdir(directory)) {
      const target = join(directory, entry);
      const targetStat = await stat(target);
      if (targetStat.isDirectory()) {
        await visit(target);
      } else if (/\.(?:m?js)$/.test(entry)) {
        files.push(target);
      }
    }
  }

  await visit(root);
  return files.sort();
}

function stripSharedModuleSyntax(source) {
  return source
    .replace(/(?:^|;)import[^;]+;/g, "")
    .replace(/(?:^|;)export\{[^}]+\};?/g, "")
    .trim();
}

function sizes(source) {
  const buffer = Buffer.from(source);
  return {
    raw: buffer.byteLength,
    gzip: gzipSync(buffer, { level: 9 }).byteLength,
    brotli: brotliCompressSync(buffer, {
      params: {
        [zlibConstants.BROTLI_PARAM_QUALITY]: 11,
      },
    }).byteLength,
  };
}

async function compileOriginal(framework, source) {
  const extension = framework === "vue" ? "vue" : "svelte";
  const caseRoot = join(workRoot, `component-${framework}`);
  assertGeneratedPath(caseRoot);
  await mkdir(caseRoot, { recursive: true });
  const entry = join(caseRoot, `TodoMVC.${extension}`);
  await writeFile(entry, source);

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
      outDir: join(caseRoot, "dist"),
      lib: {
        entry,
        formats: ["es"],
        fileName: "component",
      },
      rollupOptions: {
        external: (id) => !id.startsWith(".") && !id.startsWith("/"),
      },
    },
  });

  const outputFiles = await listJavaScriptFiles(join(caseRoot, "dist"));
  if (outputFiles.length !== 1) {
    throw new Error(
      `Expected one ${framework} JavaScript output, found ${outputFiles.length}`,
    );
  }
  const emitted = await readFile(outputFiles[0], "utf8");
  const componentOnly = stripSharedModuleSyntax(emitted);

  return {
    framework,
    emitted: sizes(emitted),
    componentOnly: sizes(componentOnly),
    moduleSyntaxBytes: Buffer.byteLength(emitted) - Buffer.byteLength(componentOnly),
  };
}

async function buildOriginalApp(framework, source, lane) {
  const extension = framework === "vue" ? "vue" : "svelte";
  const caseRoot = join(workRoot, `app-${framework}-${lane}`);
  assertGeneratedPath(caseRoot);
  await mkdir(caseRoot, { recursive: true });
  await writeFile(join(caseRoot, `TodoMVC.${extension}`), source);

  const entry =
    framework === "vue"
      ? `import { ${lane === "hydrate" ? "createSSRApp" : "createApp"} } from "vue";
import TodoMVC from "./TodoMVC.vue";

${lane === "hydrate" ? "createSSRApp" : "createApp"}(TodoMVC).mount("#app");
`
      : `import { ${lane === "hydrate" ? "hydrate" : "mount"} } from "svelte";
import TodoMVC from "./TodoMVC.svelte";

${lane === "hydrate" ? "hydrate" : "mount"}(TodoMVC, { target: document.querySelector("#app") });
`;
  await writeFile(join(caseRoot, "main.js"), entry);
  await writeFile(
    join(caseRoot, "index.html"),
    `<!doctype html>
<html lang="en">
  <head><meta charset="UTF-8"><title>Original TodoMVC specimen</title></head>
  <body><div id="app"></div><script type="module" src="/main.js"></script></body>
</html>
`,
  );

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

  const outputFiles = await listJavaScriptFiles(outDir);
  if (outputFiles.length === 0) {
    throw new Error(`The ${framework} ${lane} build emitted no JavaScript`);
  }
  const totals = { raw: 0, gzip: 0, brotli: 0 };
  const files = [];
  for (const filename of outputFiles) {
    const emitted = await readFile(filename);
    const fileSizes = sizes(emitted);
    files.push({ file: relative(outDir, filename), ...fileSizes });
    for (const metric of Object.keys(totals)) {
      totals[metric] += fileSizes[metric];
    }
  }

  return { framework, lane, files, ...totals };
}

function bytes(value) {
  return `${value.toLocaleString("en-US")} B`;
}

async function main() {
  await rm(workRoot, { recursive: true, force: true });
  await mkdir(workRoot, { recursive: true });

  const [vueInput, svelteInput] = await Promise.all([
    fetchSource("todomvc.vue"),
    fetchSource("todomvc.svelte"),
  ]);
  const migratedVueSource = vueInput.source.replace(
    "@vnode-mounted",
    "@vue:mounted",
  );
  if (migratedVueSource === vueInput.source) {
    throw new Error("Expected the historical Vue vnode hook syntax");
  }
  const componentResults = [
    await compileOriginal("vue", migratedVueSource),
    await compileOriginal("svelte", svelteInput.source),
  ];
  const appResults = [];
  for (const lane of ["csr", "hydrate"]) {
    appResults.push(
      await buildOriginalApp("vue", migratedVueSource, lane),
      await buildOriginalApp("svelte", svelteInput.source, lane),
    );
  }
  const metadata = {
    generatedAt: new Date().toISOString(),
    node: process.version,
    originalCommit,
    sources: {
      vue: vueInput.url,
      svelte: svelteInput.url,
    },
    sourceSha256: {
      vue: vueInput.sha256,
      svelte: svelteInput.sha256,
    },
    sourceMigrations: {
      vue: ["@vnode-mounted → @vue:mounted"],
      svelte: [],
    },
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
    join(benchmarkRoot, "results", "original-specimen.json"),
    `${JSON.stringify({ metadata, componentResults, appResults }, null, 2)}\n`,
  );

  const vueResult = componentResults.find(
    (result) => result.framework === "vue",
  );
  const svelteResult = componentResults.find(
    (result) => result.framework === "svelte",
  );
  const lines = [
    "# Original 2021 TodoMVC Specimen with 2026 Tooling",
    "",
    `Generated: ${metadata.generatedAt}`,
    "",
    `- Original source commit: \`${originalCommit}\``,
    "- Source-file SHA-256 digests: `original-specimen.json`",
    `- Vue: ${metadata.versions.vue}`,
    `- Svelte: ${metadata.versions.svelte}`,
    `- Vite: ${metadata.versions.vite}`,
    "- Production minifier: Oxc",
    "- Required source migration: Vue `@vnode-mounted` → `@vue:mounted`",
    "- Framework imports and the final library export are excluded from the",
    "  component-only row because those bindings are shared in an application.",
    "",
    "| Output | Vue | Svelte | Svelte / Vue |",
    "| --- | ---: | ---: | ---: |",
  ];

  for (const [label, metric] of [
    ["Component only, raw", "raw"],
    ["Component only, gzip", "gzip"],
    ["Component only, Brotli", "brotli"],
  ]) {
    const vueSize = vueResult.componentOnly[metric];
    const svelteSize = svelteResult.componentOnly[metric];
    lines.push(
    `| ${label} | ${bytes(vueSize)} | ${bytes(svelteSize)} | ${(svelteSize / vueSize).toFixed(2)}× |`,
    );
  }

  lines.push(
    "",
    "## Complete production bundles",
    "",
    "| Lane and metric | Vue | Svelte | Vue − Svelte |",
    "| --- | ---: | ---: | ---: |",
  );
  for (const lane of ["csr", "hydrate"]) {
    const vueApp = appResults.find(
      (result) => result.framework === "vue" && result.lane === lane,
    );
    const svelteApp = appResults.find(
      (result) => result.framework === "svelte" && result.lane === lane,
    );
    for (const [label, metric] of [
      ["raw", "raw"],
      ["gzip", "gzip"],
      ["Brotli", "brotli"],
    ]) {
      const delta = vueApp[metric] - svelteApp[metric];
      lines.push(
        `| ${lane} ${label} | ${bytes(vueApp[metric])} | ${bytes(svelteApp[metric])} | ${delta >= 0 ? "+" : ""}${bytes(delta)} |`,
      );
    }
  }

  lines.push(
    "",
    "This is a historical-specimen comparison, not a recommendation to write new",
    "Svelte 5 code in legacy syntax. Apart from the required Vue hook rename",
    "listed above, it holds the original sources constant while changing the",
    "compiler and minifier.",
    "",
  );
  await writeFile(
    join(benchmarkRoot, "results", "original-specimen.md"),
    `${lines.join("\n").trimEnd()}\n`,
  );

  await rm(workRoot, { recursive: true, force: true });
}

await main();
