import { spawn } from "node:child_process";
import { chromium } from "@playwright/test";
import {
  readFile,
  readdir,
  stat,
  writeFile,
} from "node:fs/promises";
import { dirname, extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import {
  brotliCompressSync,
  constants as zlibConstants,
  gzipSync,
} from "node:zlib";
import { installOpenSlidesBackend } from "../tests/openslides-tauri-mock.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const fixtureRoot = join(root, "fixtures", "openslides");
const frameworks = ["vue", "svelte"];
const previewPorts = { vue: 4484, svelte: 4485 };

function run(command, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, stdio: "inherit" });
    child.once("error", reject);
    child.once("exit", (code, signal) => {
      if (code === 0) return resolve();
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

async function filesUnder(directory) {
  const files = [];
  async function visit(current) {
    for (const entry of await readdir(current)) {
      const target = join(current, entry);
      const info = await stat(target);
      if (info.isDirectory()) await visit(target);
      else files.push(target);
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

function add(target, value) {
  for (const metric of ["raw", "gzip", "brotli"]) {
    target[metric] += value[metric];
  }
}

async function measureFile(outDir, filename) {
  const body = await readFile(join(outDir, filename));
  return { file: filename, ...sizes(body) };
}

async function waitForServer(url, child) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < 30_000) {
    if (child.exitCode !== null) {
      throw new Error(`Preview server exited with code ${child.exitCode}`);
    }
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // The preview server has not bound its port yet.
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

async function stopChild(child) {
  if (child.exitCode !== null) return;
  const exited = new Promise((resolve) => child.once("exit", resolve));
  child.kill("SIGTERM");
  await Promise.race([
    exited,
    new Promise((resolve) => setTimeout(resolve, 5_000)),
  ]);
}

function outputAsset(url, origin) {
  const parsed = new URL(url);
  if (parsed.origin !== origin) return null;
  const filename = decodeURIComponent(parsed.pathname.replace(/^\/+/, ""));
  if (!/\.(?:css|m?js|wasm)$/.test(filename)) return null;
  return filename;
}

async function measureRequested(outDir, names) {
  const files = await Promise.all(
    [...names].sort().map((filename) => measureFile(outDir, filename)),
  );
  const totals = { raw: 0, gzip: 0, brotli: 0 };
  for (const file of files) add(totals, file);
  return { files, ...totals };
}

async function measureBrowserJourney(appRoot, outDir, framework) {
  const port = previewPorts[framework];
  const origin = `http://127.0.0.1:${port}`;
  const preview = spawn(
    process.execPath,
    [
      join(appRoot, "node_modules", "vite", "bin", "vite.js"),
      "preview",
      "--host",
      "127.0.0.1",
      "--port",
      String(port),
      "--strictPort",
    ],
    { cwd: appRoot, stdio: "inherit" },
  );

  try {
    await waitForServer(origin, preview);
    const browser = await chromium.launch({ headless: true });
    try {
      const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
      const requested = new Set();
      page.on("request", (request) => {
        const filename = outputAsset(request.url(), origin);
        if (filename) requested.add(filename);
      });
      await installOpenSlidesBackend(page);
      await page.goto(origin, { waitUntil: "networkidle" });
      await page
        .getByRole("heading", { name: "Your Presentations" })
        .waitFor({ state: "visible" });
      const dashboard = await measureRequested(outDir, requested);

      await page.getByRole("button", { name: "Benchmark Deck" }).click();
      await page.waitForURL(/#\/editor\/project-1$/);
      await page
        .locator(".shiki-magic-move-container")
        .last()
        .waitFor({ state: "visible", timeout: 15_000 });
      await page.waitForLoadState("networkidle");
      const editor = await measureRequested(outDir, requested);
      return { dashboard, editor };
    } finally {
      await browser.close();
    }
  } finally {
    await stopChild(preview);
  }
}

function collectInitialManifestFiles(manifest) {
  const entry = Object.entries(manifest).find(([, value]) => value.isEntry);
  if (!entry) throw new Error("Vite manifest has no entry");
  const files = new Set();
  const visited = new Set();

  function visit(key) {
    if (visited.has(key)) return;
    visited.add(key);
    const item = manifest[key];
    if (!item) throw new Error(`Missing manifest entry: ${key}`);
    files.add(item.file);
    for (const css of item.css ?? []) files.add(css);
    for (const imported of item.imports ?? []) visit(imported);
  }

  visit(entry[0]);
  return [...files].sort();
}

async function sourceStats(appRoot, framework) {
  const extension = framework === "vue" ? ".vue" : ".svelte";
  const sourceFiles = (await filesUnder(join(appRoot, "src"))).filter((file) =>
    [extension, ".ts", ".js", ".css"].includes(extname(file)),
  );
  let lines = 0;
  let componentLines = 0;
  let components = 0;
  for (const file of sourceFiles) {
    const count = (await readFile(file, "utf8")).split("\n").length;
    lines += count;
    if (file.endsWith(extension)) {
      components += 1;
      componentLines += count;
    }
  }
  return {
    files: sourceFiles.length,
    lines,
    components,
    componentLines,
  };
}

async function measure(framework) {
  const appRoot = join(fixtureRoot, framework);
  await run("bun", ["run", "build"], appRoot);
  const outDir = join(appRoot, "dist");
  const manifest = JSON.parse(
    await readFile(join(outDir, ".vite", "manifest.json"), "utf8"),
  );
  const initialNames = collectInitialManifestFiles(manifest);
  const initialFiles = await Promise.all(
    initialNames.map((filename) => measureFile(outDir, filename)),
  );
  const initial = { raw: 0, gzip: 0, brotli: 0 };
  for (const file of initialFiles) add(initial, file);

  const emittedNames = (await filesUnder(outDir))
    .map((file) => relative(outDir, file))
    .filter((file) => /\.(?:css|m?js|wasm)$/.test(file));
  const emittedFiles = await Promise.all(
    emittedNames.map((filename) => measureFile(outDir, filename)),
  );
  const complete = { raw: 0, gzip: 0, brotli: 0 };
  for (const file of emittedFiles) add(complete, file);
  const journey = await measureBrowserJourney(appRoot, outDir, framework);

  return {
    framework,
    source: await sourceStats(appRoot, framework),
    initial: { files: initialFiles, ...initial },
    journey,
    complete: { fileCount: emittedFiles.length, ...complete },
  };
}

function bytes(value) {
  const sign = value < 0 ? "−" : "";
  return `${sign}${Math.abs(value).toLocaleString("en-US")} B`;
}

async function main() {
  const results = [];
  for (const framework of frameworks) results.push(await measure(framework));
  const vue = results.find((result) => result.framework === "vue");
  const svelte = results.find((result) => result.framework === "svelte");
  const metadata = {
    generatedAt: new Date().toISOString(),
    sourceRepository: "https://github.com/codewiththiha/OpenSlides",
    sourceCommit: "a8138eb26c93df378119147c036c34fe7d83b6a7",
    measurement:
      "Production JS/CSS/Wasm requested by a cold headless browser from dashboard through opening the seeded editor; Vite entry-manifest totals are also recorded",
    compression:
      "Each emitted response compressed independently with gzip level 9 and Brotli quality 11",
    splitting:
      "Dashboard and editor are lazy-loaded route chunks in both implementations",
    status:
      "Behaviorally matched for the documented benchmark scope; the shared Playwright contract passes against both production implementations",
  };

  await writeFile(
    join(root, "openslides.json"),
    `${JSON.stringify({ metadata, results }, null, 2)}\n`,
  );

  const lines = [
    "# OpenSlides real-application benchmark",
    "",
    `Generated: ${metadata.generatedAt}`,
    "",
    `> ${metadata.status}`,
    "",
    `- Source: [OpenSlides](${metadata.sourceRepository})`,
    `- Pinned commit: \`${metadata.sourceCommit}\``,
    `- Measurement: ${metadata.measurement}`,
    `- Compression: ${metadata.compression}`,
    `- Route splitting: ${metadata.splitting}`,
    "",
    "- Shared behavior contract: [`tests/openslides-parity.spec.mjs`](tests/openslides-parity.spec.mjs)",
    "- Parity ledger: [`fixtures/openslides/PARITY.md`](fixtures/openslides/PARITY.md)",
    "",
    "| Entry JavaScript + CSS | Vue | Svelte | Vue − Svelte |",
    "| --- | ---: | ---: | ---: |",
  ];
  for (const [label, metric] of [
    ["Raw", "raw"],
    ["gzip", "gzip"],
    ["Brotli", "brotli"],
  ]) {
    lines.push(
      `| ${label} | ${bytes(vue.initial[metric])} | ${bytes(svelte.initial[metric])} | ${bytes(vue.initial[metric] - svelte.initial[metric])} |`,
    );
  }
  lines.push(
    "",
    "| Cold production journey | Vue | Svelte | Vue − Svelte |",
    "| --- | ---: | ---: | ---: |",
  );
  for (const [label, metric] of [
    ["Dashboard gzip", "gzip"],
    ["Dashboard Brotli", "brotli"],
  ]) {
    lines.push(
      `| ${label} | ${bytes(vue.journey.dashboard[metric])} | ${bytes(svelte.journey.dashboard[metric])} | ${bytes(vue.journey.dashboard[metric] - svelte.journey.dashboard[metric])} |`,
    );
  }
  for (const [label, metric] of [
    ["Dashboard → editor gzip", "gzip"],
    ["Dashboard → editor Brotli", "brotli"],
  ]) {
    lines.push(
      `| ${label} | ${bytes(vue.journey.editor[metric])} | ${bytes(svelte.journey.editor[metric])} | ${bytes(vue.journey.editor[metric] - svelte.journey.editor[metric])} |`,
    );
  }
  lines.push(
    "",
    "The cold journey includes the Shiki worker, Wasm engine, selected languages,",
    "and selected theme actually requested by each production build. Both",
    "implementations request two Shiki asset sets after the editor opens.",
    "",
    "| Source inventory | Vue | Svelte |",
    "| --- | ---: | ---: |",
    `| Components | ${vue.source.components} | ${svelte.source.components} |`,
    `| Component lines | ${vue.source.componentLines.toLocaleString("en-US")} | ${svelte.source.componentLines.toLocaleString("en-US")} |`,
    `| Total TS/JS/CSS/component lines | ${vue.source.lines.toLocaleString("en-US")} | ${svelte.source.lines.toLocaleString("en-US")} |`,
    "",
    "The implementations are behavior-matched rather than source-shape-matched.",
    "Vue uses fewer, larger component files; Svelte uses more, smaller component",
    "and rune-module files. This case study therefore measures two credible",
    "implementations of one product, not framework runtime bytes in isolation.",
    "",
    "The complete-build totals include hundreds of optional Shiki language and",
    "theme chunks. They are recorded in `openslides.json` for reproducibility",
    "but are not treated as an application-transfer result.",
    "",
  );
  await writeFile(join(root, "openslides.md"), lines.join("\n"));
}

await main();
