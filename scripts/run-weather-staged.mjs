import {
  brotliCompressSync,
  constants as zlibConstants,
  gzipSync,
} from "node:zlib";
import {
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
const fixtureRoot = join(root, "fixtures", "weather-staged");
const workRoot = join(root, ".work-weather-staged");
const packageJson = JSON.parse(await readFile(join(root, "package.json"), "utf8"));

async function listTransferFiles(directory) {
  const files = [];
  async function visit(current) {
    for (const entry of await readdir(current)) {
      const target = join(current, entry);
      const info = await stat(target);
      if (info.isDirectory()) await visit(target);
      else if (/\.(?:css|m?js)$/.test(entry)) files.push(target);
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

async function measure(framework) {
  const caseRoot = join(fixtureRoot, framework);
  const outDir = join(workRoot, framework);
  await build({
    root: caseRoot,
    configFile: false,
    logLevel: "error",
    resolve: { alias: { "@shared": join(fixtureRoot, "shared") } },
    plugins:
      framework === "vue"
        ? [vue({ features: { optionsAPI: false } })]
        : [svelte({ compilerOptions: { discloseVersion: false } })],
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
  const complete = { raw: 0, gzip: 0, brotli: 0 };
  for (const filename of await listTransferFiles(outDir)) {
    const fileSizes = sizes(await readFile(filename));
    files.push({ file: relative(outDir, filename), ...fileSizes });
    for (const metric of ["raw", "gzip", "brotli"]) {
      complete[metric] += fileSizes[metric];
    }
  }
  return { framework, files, complete };
}

function bytes(value) {
  return `${value.toLocaleString("en-US")} B`;
}

async function main() {
  await rm(workRoot, { recursive: true, force: true });
  await mkdir(workRoot, { recursive: true });
  try {
    const results = [await measure("vue"), await measure("svelte")];
    const metadata = {
      generatedAt: new Date().toISOString(),
      node: process.version,
      versions: {
        vue: packageJson.dependencies.vue,
        svelte: packageJson.dependencies.svelte,
        vite: packageJson.dependencies.vite,
      },
      profile:
        "Vue Composition-only and Svelte version disclosure disabled",
      measurement:
        "Every emitted JavaScript and CSS response counted once",
      compression:
        "gzip level 9 and Brotli quality 11, applied per response",
    };

    await writeFile(
      join(root, "weather-staged.json"),
      `${JSON.stringify({ metadata, results }, null, 2)}\n`,
    );

    const vueResult = results.find((result) => result.framework === "vue");
    const svelteResult = results.find(
      (result) => result.framework === "svelte",
    );
    const lines = [
      "# Normalized Weather Workspace Results",
      "",
      `Generated: ${metadata.generatedAt}`,
      "",
      `- Vue: ${metadata.versions.vue}`,
      `- Svelte: ${metadata.versions.svelte}`,
      `- Vite: ${metadata.versions.vite}`,
      `- Profile: ${metadata.profile}`,
      `- Measurement: ${metadata.measurement}`,
      `- Compression: ${metadata.compression}`,
      "",
      "| Complete core application | Vue | Svelte | Vue − Svelte |",
      "| --- | ---: | ---: | ---: |",
    ];
    for (const [label, metric] of [
      ["Raw", "raw"],
      ["gzip", "gzip"],
      ["Brotli", "brotli"],
    ]) {
      const delta =
        vueResult.complete[metric] - svelteResult.complete[metric];
      lines.push(
        `| ${label} | ${bytes(vueResult.complete[metric])} | ${bytes(svelteResult.complete[metric])} | ${delta >= 0 ? "+" : ""}${bytes(delta)} |`,
      );
    }
    lines.push(
      "",
      "This is the normalized core Weather Front product surface. Additional",
      "cumulative product stages will be added only after this baseline passes",
      "the shared behavior test.",
      "",
    );
    await writeFile(join(root, "weather-staged.md"), lines.join("\n"));
  } finally {
    await rm(workRoot, { recursive: true, force: true });
  }
}

await main();
