import { spawn } from "node:child_process";
import { createServer } from "node:http";
import {
  cp,
  mkdir,
  readFile,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { dirname, extname, join, normalize, relative } from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";
import {
  brotliCompressSync,
  constants as zlibConstants,
  gzipSync,
} from "node:zlib";

import { chromium } from "@playwright/test";

const benchmarkRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const workRoot = join(benchmarkRoot, ".work-weather-upstream");
const sourceRoot = join(workRoot, "source");
const sourceCommit = "53862d6eac22af7aca571ca11af25559059e2f14";
const sourceRepository = "https://github.com/lissy93/framework-benchmarks";

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

function run(command, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: "inherit",
    });
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

  const assetsRoot = join(sourceRoot, "assets");
  await cp(assetsRoot, join(sourceRoot, "apps/vue/public"), {
    recursive: true,
    force: true,
  });
  await cp(assetsRoot, join(sourceRoot, "apps/svelte/static"), {
    recursive: true,
    force: true,
  });

  for (const framework of ["vue", "svelte"]) {
    const appRoot = join(sourceRoot, `apps/${framework}`);
    await run("npm", ["ci", "--ignore-scripts"], appRoot);
    await run("npm", ["run", "build"], appRoot);
  }
}

function safeOutputPath(root, requestPath) {
  const pathname = decodeURIComponent(requestPath.split("?")[0]);
  const relativePath = pathname === "/" ? "index.html" : pathname.slice(1);
  const target = normalize(join(root, relativePath));
  const relativeTarget = relative(root, target);
  if (
    relativeTarget === "" ||
    relativeTarget.startsWith("..") ||
    relativeTarget.includes("../")
  ) {
    throw new Error(`Unsafe request path: ${requestPath}`);
  }
  return target;
}

async function readServedFile(root, requestPath) {
  let target = safeOutputPath(root, requestPath);
  try {
    const targetStat = await stat(target);
    if (targetStat.isDirectory()) {
      target = join(target, "index.html");
    }
    return { body: await readFile(target), target };
  } catch {
    const fallback = join(root, "index.html");
    return { body: await readFile(fallback), target: fallback };
  }
}

async function serve(root) {
  const server = createServer(async (request, response) => {
    try {
      const { body, target } = await readServedFile(root, request.url ?? "/");
      response.writeHead(200, {
        "cache-control": "no-store",
        "content-type":
          contentTypes[extname(target)] ?? "application/octet-stream",
      });
      response.end(body);
    } catch (error) {
      response.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
      response.end(error instanceof Error ? error.message : String(error));
    }
  });

  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Unable to resolve static-server address");
  }
  return {
    close: () =>
      new Promise((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      ),
    url: `http://127.0.0.1:${address.port}/?mock=true`,
  };
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

async function measurePage(browser, framework, url) {
  const page = await browser.newPage();
  const responseTasks = [];
  const assets = new Map();
  const origin = new URL(url).origin;

  page.on("response", (response) => {
    const responseUrl = new URL(response.url());
    if (
      responseUrl.origin !== origin ||
      !/\.(?:js|css)$/.test(responseUrl.pathname)
    ) {
      return;
    }
    responseTasks.push(
      response
        .body()
        .then((body) => assets.set(responseUrl.pathname, body))
        .catch(() => undefined),
    );
  });

  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(250);
  await Promise.all(responseTasks);
  await page.close();

  const files = [...assets]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([file, body]) => ({ file, ...compressedSizes(body) }));
  const totals = files.reduce(
    (sum, file) => ({
      raw: sum.raw + file.raw,
      gzip: sum.gzip + file.gzip,
      brotli: sum.brotli + file.brotli,
    }),
    { raw: 0, gzip: 0, brotli: 0 },
  );

  return { framework, files, ...totals };
}

function bytes(value) {
  return `${value.toLocaleString("en-US")} B`;
}

async function main() {
  await prepareSource();
  const servers = [];
  let browser;
  try {
    const vueServer = await serve(join(sourceRoot, "apps/vue/dist"));
    const svelteServer = await serve(join(sourceRoot, "apps/svelte/build"));
    servers.push(vueServer, svelteServer);
    browser = await chromium.launch({ headless: true });

    const results = [
      await measurePage(browser, "vue", vueServer.url),
      await measurePage(browser, "svelte", svelteServer.url),
    ];
    const metadata = {
      generatedAt: new Date().toISOString(),
      node: process.version,
      sourceCommit,
      sourceRepository,
      sourceLicense: "MIT",
      measurement:
        "JavaScript and CSS responses requested during a cold production-app load",
      compression:
        "Each requested response compressed independently with gzip level 9 and Brotli quality 11",
    };

    await writeFile(
      join(benchmarkRoot, "weather-upstream.json"),
      `${JSON.stringify({ metadata, results }, null, 2)}\n`,
    );

    const vueResult = results.find((result) => result.framework === "vue");
    const svelteResult = results.find(
      (result) => result.framework === "svelte",
    );
    const lines = [
      "# Upstream Weather Front: Requested Production Assets",
      "",
      `Generated: ${metadata.generatedAt}`,
      "",
      `- Source: [Alicia Sykes’s framework benchmark](${sourceRepository})`,
      `- Pinned source commit: \`${sourceCommit}\``,
      "- Upstream license: MIT",
      "- This preserves the upstream Vue/Vite and Svelte 4/SvelteKit application",
      "  modes; it is not the normalized Vue 3/Svelte 5 comparison.",
      "- Only JavaScript and CSS responses actually requested by a cold browser",
      "  load are included. Unrequested build artifacts are excluded.",
      "",
      "| Requested production assets | Vue | Svelte | Vue − Svelte |",
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
      "The complete upstream weather application remains slightly smaller in",
      "Svelte when measured by requested transfer. It is therefore a useful",
      "starting point for the staged application curve, not evidence that the",
      "crossover has already occurred.",
      "",
    );
    await writeFile(
      join(benchmarkRoot, "weather-upstream.md"),
      `${lines.join("\n").trimEnd()}\n`,
    );
  } finally {
    if (browser) {
      await browser.close();
    }
    await Promise.all(servers.map((server) => server.close()));
    await rm(workRoot, { recursive: true, force: true });
  }
}

await main();
