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
const workRoot = join(benchmarkRoot, ".work-matched");
const sourceCommit = "6bd71fcab935b7e4c627b7c394a86633fcd8feea";
const sourceBaseUrl =
  `https://raw.githubusercontent.com/krausest/js-framework-benchmark/${sourceCommit}`;
const packageJson = JSON.parse(
  await readFile(join(benchmarkRoot, "package.json"), "utf8"),
);

const sourceFiles = {
  vue: [
    "frameworks/keyed/vue/index.html",
    "frameworks/keyed/vue/src/App.vue",
    "frameworks/keyed/vue/src/data.js",
    "frameworks/keyed/vue/src/main.js",
  ],
  svelte: [
    "frameworks/keyed/svelte/index.html",
    "frameworks/keyed/svelte/src/Main.svelte",
    "frameworks/keyed/svelte/src/main.js",
  ],
};

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

async function fetchToCase(framework, sourcePath) {
  const prefix = `frameworks/keyed/${framework}/`;
  const destination = join(workRoot, framework, sourcePath.slice(prefix.length));
  assertGeneratedPath(destination);
  const url = `${sourceBaseUrl}/${sourcePath}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Unable to fetch ${url}: ${response.status}`);
  }
  const source = await response.text();
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, source);
  return {
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

function compressedSizes(buffer) {
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

async function buildApp(framework) {
  const caseRoot = join(workRoot, framework);
  const sources = await Promise.all(
    sourceFiles[framework].map((sourcePath) =>
      fetchToCase(framework, sourcePath),
    ),
  );
  if (framework === "svelte") {
    await writeFile(
      join(caseRoot, "index.html"),
      `<!doctype html>
<html lang="en">
  <head><meta charset="UTF-8"><title>Svelte</title></head>
  <body>
    <div id="main" class="container"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
`,
    );
  }
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

  const files = [];
  const totals = { raw: 0, gzip: 0, brotli: 0 };
  const outputFiles = await listJavaScriptFiles(outDir);
  if (outputFiles.length === 0) {
    throw new Error(`The ${framework} build emitted no JavaScript`);
  }
  for (const filename of outputFiles) {
    const buffer = await readFile(filename);
    const fileSizes = compressedSizes(buffer);
    files.push({
      file: relative(outDir, filename),
      ...fileSizes,
    });
    for (const metric of Object.keys(totals)) {
      totals[metric] += fileSizes[metric];
    }
  }

  return { framework, sources, files, ...totals };
}

function bytes(value) {
  return `${value.toLocaleString("en-US")} B`;
}

async function main() {
  await rm(workRoot, { recursive: true, force: true });
  await mkdir(workRoot, { recursive: true });

  const results = [await buildApp("vue"), await buildApp("svelte")];
  const metadata = {
    generatedAt: new Date().toISOString(),
    node: process.version,
    sourceCommit,
    sourceRepository: "https://github.com/krausest/js-framework-benchmark",
    sourceLicense: "Apache-2.0",
    buildNormalizations: {
      vue: [],
      svelte: [
        "Replaced the Rollup-oriented dist/main.js script tag with a Vite module entry to /src/main.js",
      ],
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
    join(benchmarkRoot, "matched-app.json"),
    `${JSON.stringify({ metadata, results }, null, 2)}\n`,
  );

  const vueResult = results.find((result) => result.framework === "vue");
  const svelteResult = results.find((result) => result.framework === "svelte");
  const lines = [
    "# Matched Complete-Application Bundle",
    "",
    `Generated: ${metadata.generatedAt}`,
    "",
    `- Source: js-framework-benchmark keyed implementations at \`${sourceCommit}\``,
    "- Source-file URLs and SHA-256 digests: `matched-app.json`",
    `- Vue: ${metadata.versions.vue}`,
    `- Svelte: ${metadata.versions.svelte}`,
    `- Vite: ${metadata.versions.vite}`,
    "- Both sources implement the same benchmark behavior and are built here with",
    "  the same Vite target, Oxc minifier, and compression settings.",
    "- Svelte's Rollup-oriented HTML script tag is normalized to a Vite module",
    "  entry; application source is unchanged.",
    "",
    "| Total emitted JavaScript | Vue | Svelte | Vue − Svelte |",
    "| --- | ---: | ---: | ---: |",
  ];

  for (const [label, metric] of [
    ["Raw", "raw"],
    ["gzip", "gzip"],
    ["Brotli", "brotli"],
  ]) {
    const delta = vueResult[metric] - svelteResult[metric];
    lines.push(
      `| ${label} | ${bytes(vueResult[metric])} | ${bytes(svelteResult[metric])} | ${delta >= 0 ? "+" : ""}${bytes(delta)} |`,
    );
  }

  lines.push(
    "",
    "This is more representative than multiplying one isolated component because",
    "it measures complete production bundles and whole-bundle compression. It is",
    "still one deliberately small benchmark application, not a proxy for every",
    "large product architecture.",
    "",
  );
  await writeFile(
    join(benchmarkRoot, "matched-app.md"),
    `${lines.join("\n").trimEnd()}\n`,
  );

  await rm(workRoot, { recursive: true, force: true });
}

await main();
