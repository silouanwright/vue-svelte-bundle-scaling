import { spawn } from "node:child_process";
import { readdir, readFile, rm, mkdir, writeFile } from "node:fs/promises";
import { dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";
import {
  brotliCompressSync,
  constants as zlibConstants,
  gzipSync,
} from "node:zlib";

const benchmarkRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const workRoot = join(benchmarkRoot, ".work-terminal-control");
const sourceRoot = join(workRoot, "source");
const sourceCommit = "2c338de860222deba6b842260cfbec6609c272bd";
const sourceRepository =
  "https://github.com/naufalafif/realworld-js-framework-comparison";
const pnpmVersion = "10.14.0";

function run(command, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, stdio: "inherit" });
    child.once("error", reject);
    child.once("exit", (code, signal) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(
        new Error(
          `${command} ${args.join(" ")} failed with ${
            signal ? `signal ${signal}` : `exit code ${code}`
          }`,
        ),
      );
    });
  });
}

function runPnpm(args) {
  return run("npx", ["--yes", `pnpm@${pnpmVersion}`, ...args], sourceRoot);
}

async function prepareSource() {
  await rm(workRoot, { recursive: true, force: true });
  await mkdir(sourceRoot, { recursive: true });
  await run("git", ["init", "--quiet"], sourceRoot);
  await run("git", ["remote", "add", "origin", sourceRepository], sourceRoot);
  await run(
    "git",
    ["fetch", "--quiet", "--depth", "1", "origin", sourceCommit],
    sourceRoot,
  );
  await run("git", ["checkout", "--quiet", "FETCH_HEAD"], sourceRoot);

  const vueConfigPath = join(sourceRoot, "apps/xterm/vue/vite.config.ts");
  const vueConfig = await readFile(vueConfigPath, "utf8");
  const marker = "  plugins: [vue(), tailwindcss()],\n";
  if (!vueConfig.includes(marker)) {
    throw new Error("Unable to locate the expected Vue Vite configuration");
  }
  await writeFile(
    vueConfigPath,
    vueConfig.replace(
      marker,
      `${marker}  define: {\n` +
        "    __VUE_OPTIONS_API__: false,\n" +
        "    __VUE_PROD_DEVTOOLS__: false,\n" +
        "    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,\n" +
        "  },\n",
    ),
  );

  await runPnpm(["install", "--frozen-lockfile", "--ignore-scripts"]);
  await runPnpm(["--filter", "@comparison/xterm-vue", "build"]);
  await runPnpm(["--filter", "@comparison/xterm-svelte", "build"]);
}

async function listFiles(root) {
  const entries = await readdir(root, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const path = join(root, entry.name);
      return entry.isDirectory() ? listFiles(path) : [path];
    }),
  );
  return files.flat();
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

async function measureBuild(framework) {
  const distRoot = join(sourceRoot, `apps/xterm/${framework}/dist`);
  const emitted = (await listFiles(distRoot))
    .filter((file) => [".css", ".js"].includes(extname(file)))
    .sort();
  const extensionCounts = new Map();
  const files = [];

  for (const path of emitted) {
    const extension = extname(path).slice(1);
    const count = (extensionCounts.get(extension) ?? 0) + 1;
    extensionCounts.set(extension, count);
    const suffix = count === 1 ? "" : `-${count}`;
    files.push({
      file: `assets/index${suffix}.${extension}`,
      ...compressedSizes(await readFile(path)),
    });
  }

  files.sort((left, right) => left.file.localeCompare(right.file));
  const totals = files.reduce(
    (sum, file) => ({
      raw: sum.raw + file.raw,
      gzip: sum.gzip + file.gzip,
      brotli: sum.brotli + file.brotli,
    }),
    { raw: 0, gzip: 0, brotli: 0 },
  );
  return { framework, ...totals, files };
}

async function packageVersion(framework, packageName) {
  const packagePath = join(
    sourceRoot,
    `apps/xterm/${framework}/node_modules`,
    packageName,
    "package.json",
  );
  return JSON.parse(await readFile(packagePath, "utf8")).version;
}

function bytes(value) {
  return `${value.toLocaleString("en-US")} B`;
}

async function writeResults(results, metadata) {
  const resultsRoot = join(benchmarkRoot, "results");
  await writeFile(
    join(resultsRoot, "terminal-control.json"),
    `${JSON.stringify({ metadata, results }, null, 2)}\n`,
  );

  const vue = results.find((result) => result.framework === "vue");
  const svelte = results.find((result) => result.framework === "svelte");
  const lines = [
    "# Independent Terminal Application",
    "",
    `Generated: ${metadata.generatedAt}`,
    "",
    `- Source: [realworld-js-framework-comparison](${sourceRepository}/tree/${sourceCommit})`,
    `- Pinned source commit: \`${sourceCommit}\``,
    "- Upstream license: MIT",
    "- Both independently authored implementations use plain Vite production builds.",
    "- The Vue build uses Composition API only, with its unused Options API and",
    "  production diagnostics disabled.",
    "- JavaScript and CSS are included; each emitted response is compressed",
    "  independently.",
    "",
    "| Complete production assets | Vue | Svelte | Vue − Svelte |",
    "| --- | ---: | ---: | ---: |",
    `| Raw | ${bytes(vue.raw)} | ${bytes(svelte.raw)} | ${bytes(vue.raw - svelte.raw)} |`,
    `| Gzip | ${bytes(vue.gzip)} | ${bytes(svelte.gzip)} | ${bytes(vue.gzip - svelte.gzip)} |`,
    `| Brotli | ${bytes(vue.brotli)} | ${bytes(svelte.brotli)} | ${bytes(vue.brotli - svelte.brotli)} |`,
    "",
    "Svelte is smaller in this complete small application.",
  ];
  await writeFile(
    join(resultsRoot, "terminal-control.md"),
    `${lines.join("\n")}\n`,
  );
}

async function main() {
  await prepareSource();
  const results = [await measureBuild("vue"), await measureBuild("svelte")];
  const metadata = {
    generatedAt: new Date().toISOString(),
    node: process.version,
    source: "naufalafif/realworld-js-framework-comparison",
    sourceCommit,
    sourceLicense: "MIT",
    profile:
      "Plain Vite production builds; Vue Composition API only with the unused Options API and production diagnostics disabled",
    compression:
      "gzip level 9 and Brotli quality 11; each emitted JavaScript and CSS response compressed independently",
    resolvedVersions: {
      vue: await packageVersion("vue", "vue"),
      svelte: await packageVersion("svelte", "svelte"),
      vite: await packageVersion("vue", "vite"),
      xterm: await packageVersion("vue", "@xterm/xterm"),
      pnpm: pnpmVersion,
    },
  };
  await writeResults(results, metadata);
  await rm(workRoot, { recursive: true, force: true });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
