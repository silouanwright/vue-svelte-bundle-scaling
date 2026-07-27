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
import process from "node:process";

import { svelte } from "@sveltejs/vite-plugin-svelte";
import vue from "@vitejs/plugin-vue";
import { build } from "vite";

const benchmarkRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const workRoot = join(benchmarkRoot, ".work");
const packageJson = JSON.parse(
  await readFile(join(benchmarkRoot, "package.json"), "utf8"),
);

const componentCounts = [0, 1, 2, 5, 10, 20, 40, 80, 160, 320, 640];
const frameworks = ["vue", "svelte"];
const workloads = ["counter", "todo"];
const lanes = ["csr", "hydrate", "ssr"];

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

function vueCounter(index) {
  return `<script setup>
import { computed, ref } from "vue";

const count = ref(${index});
const doubled = computed(() => count.value * 2);
const isEven = computed(() => count.value % 2 === 0);
</script>

<template>
  <section :data-workload="${index}" :class="{ even: isEven }">
    <h2>Counter ${index}</h2>
    <button type="button" @click="count--">Decrease</button>
    <output>{{ count }} / {{ doubled }}</output>
    <button type="button" @click="count++">Increase</button>
    <p v-if="isEven">The value is even.</p>
    <p v-else>The value is odd.</p>
  </section>
</template>
`;
}

function svelteCounter(index) {
  return `<script>
  let count = $state(${index});
  let doubled = $derived(count * 2);
  let isEven = $derived(count % 2 === 0);
</script>

<section data-workload="${index}" class={{ even: isEven }}>
  <h2>Counter ${index}</h2>
  <button type="button" onclick={() => count--}>Decrease</button>
  <output>{count} / {doubled}</output>
  <button type="button" onclick={() => count++}>Increase</button>
  {#if isEven}
    <p>The value is even.</p>
  {:else}
    <p>The value is odd.</p>
  {/if}
</section>
`;
}

function vueTodo(index) {
  const baseId = index * 10;
  return `<script setup>
import { computed, ref } from "vue";

const draft = ref("");
const filter = ref("all");
const nextId = ref(${baseId + 4});
const todos = ref([
  { id: ${baseId + 1}, title: "Read source ${index}", done: true },
  { id: ${baseId + 2}, title: "Measure build ${index}", done: false },
  { id: ${baseId + 3}, title: "Record result ${index}", done: false },
]);

const visibleTodos = computed(() => {
  if (filter.value === "active") {
    return todos.value.filter((todo) => !todo.done);
  }
  if (filter.value === "completed") {
    return todos.value.filter((todo) => todo.done);
  }
  return todos.value;
});

const remaining = computed(
  () => todos.value.filter((todo) => !todo.done).length,
);

function addTodo() {
  const title = draft.value.trim();
  if (!title) return;
  todos.value.push({ id: nextId.value++, title, done: false });
  draft.value = "";
}

function removeTodo(id) {
  todos.value = todos.value.filter((todo) => todo.id !== id);
}
</script>

<template>
  <section :data-workload="${index}" class="todo-workload">
    <h2>Todo list ${index}</h2>

    <form @submit.prevent="addTodo">
      <label>
        New task
        <input v-model="draft" autocomplete="off" />
      </label>
      <button type="submit" :disabled="!draft.trim()">Add</button>
    </form>

    <nav aria-label="Task filters">
      <button type="button" :aria-pressed="filter === 'all'" @click="filter = 'all'">
        All
      </button>
      <button type="button" :aria-pressed="filter === 'active'" @click="filter = 'active'">
        Active
      </button>
      <button
        type="button"
        :aria-pressed="filter === 'completed'"
        @click="filter = 'completed'"
      >
        Completed
      </button>
    </nav>

    <ul v-if="visibleTodos.length">
      <li
        v-for="todo in visibleTodos"
        :key="todo.id"
        :class="{ completed: todo.done }"
      >
        <label>
          <input v-model="todo.done" type="checkbox" />
          <span>{{ todo.title }}</span>
        </label>
        <button
          type="button"
          :aria-label="'Remove ' + todo.title"
          @click="removeTodo(todo.id)"
        >
          Remove
        </button>
      </li>
    </ul>
    <p v-else>No matching tasks.</p>

    <footer v-if="todos.length">
      {{ remaining }} {{ remaining === 1 ? "item" : "items" }} remaining
    </footer>
    <footer v-else>Nothing left to do.</footer>
  </section>
</template>
`;
}

function svelteTodo(index) {
  const baseId = index * 10;
  return `<script>
  let draft = $state("");
  let filter = $state("all");
  let nextId = $state(${baseId + 4});
  let todos = $state([
    { id: ${baseId + 1}, title: "Read source ${index}", done: true },
    { id: ${baseId + 2}, title: "Measure build ${index}", done: false },
    { id: ${baseId + 3}, title: "Record result ${index}", done: false },
  ]);

  let visibleTodos = $derived(
    filter === "active"
      ? todos.filter((todo) => !todo.done)
      : filter === "completed"
        ? todos.filter((todo) => todo.done)
        : todos,
  );

  let remaining = $derived(todos.filter((todo) => !todo.done).length);

  function addTodo(event) {
    event.preventDefault();
    const title = draft.trim();
    if (!title) return;
    todos.push({ id: nextId++, title, done: false });
    draft = "";
  }

  function removeTodo(id) {
    todos = todos.filter((todo) => todo.id !== id);
  }
</script>

<section data-workload="${index}" class="todo-workload">
  <h2>Todo list ${index}</h2>

  <form onsubmit={addTodo}>
    <label>
      New task
      <input bind:value={draft} autocomplete="off" />
    </label>
    <button type="submit" disabled={!draft.trim()}>Add</button>
  </form>

  <nav aria-label="Task filters">
    <button type="button" aria-pressed={filter === "all"} onclick={() => (filter = "all")}>
      All
    </button>
    <button
      type="button"
      aria-pressed={filter === "active"}
      onclick={() => (filter = "active")}
    >
      Active
    </button>
    <button
      type="button"
      aria-pressed={filter === "completed"}
      onclick={() => (filter = "completed")}
    >
      Completed
    </button>
  </nav>

  {#if visibleTodos.length}
    <ul>
      {#each visibleTodos as todo (todo.id)}
        <li class={{ completed: todo.done }}>
          <label>
            <input bind:checked={todo.done} type="checkbox" />
            <span>{todo.title}</span>
          </label>
          <button
            type="button"
            aria-label={"Remove " + todo.title}
            onclick={() => removeTodo(todo.id)}
          >
            Remove
          </button>
        </li>
      {/each}
    </ul>
  {:else}
    <p>No matching tasks.</p>
  {/if}

  {#if todos.length}
    <footer>
      {remaining} {remaining === 1 ? "item" : "items"} remaining
    </footer>
  {:else}
    <footer>Nothing left to do.</footer>
  {/if}
</section>
`;
}

function componentSource(framework, workload, index) {
  if (framework === "vue" && workload === "counter") return vueCounter(index);
  if (framework === "svelte" && workload === "counter") {
    return svelteCounter(index);
  }
  if (framework === "vue" && workload === "todo") return vueTodo(index);
  return svelteTodo(index);
}

function appSource(framework, workload, count) {
  const extension = framework === "vue" ? "vue" : "svelte";
  const componentName = workload === "counter" ? "CounterWorkload" : "TodoWorkload";
  const imports = Array.from(
    { length: count },
    (_, index) =>
      `import ${componentName}${index} from "./components/${componentName}${index}.${extension}";`,
  ).join("\n");
  const instances = Array.from(
    { length: count },
    (_, index) => `    <${componentName}${index} />`,
  ).join("\n");

  if (framework === "vue") {
    return `<script setup>
${imports}
</script>

<template>
  <main data-framework="vue" data-workload="${workload}">
    <h1>Bundle scaling benchmark</h1>
${instances}
  </main>
</template>
`;
  }

  return `<script>
  ${imports.replaceAll("\n", "\n  ")}
</script>

<main data-framework="svelte" data-workload="${workload}">
  <h1>Bundle scaling benchmark</h1>
${instances}
</main>
`;
}

function clientEntry(framework, lane) {
  if (framework === "vue") {
    const factory = lane === "hydrate" ? "createSSRApp" : "createApp";
    return `import { ${factory} } from "vue";
import App from "./App.vue";

${factory}(App).mount("#app");
`;
  }

  const operation = lane === "hydrate" ? "hydrate" : "mount";
  return `import { ${operation} } from "svelte";
import App from "./App.svelte";

${operation}(App, { target: document.querySelector("#app") });
`;
}

function serverEntry(framework) {
  if (framework === "vue") {
    return `import { createSSRApp } from "vue";
import { renderToString } from "@vue/server-renderer";
import App from "./App.vue";

export async function render() {
  return renderToString(createSSRApp(App));
}
`;
  }

  return `import { render as renderComponent } from "svelte/server";
import App from "./App.svelte";

export function render() {
  return renderComponent(App).body;
}
`;
}

async function generateCase({ framework, workload, count, lane }) {
  const caseRoot = join(
    workRoot,
    `${framework}-${workload}-${lane}-${String(count).padStart(3, "0")}`,
  );
  assertGeneratedPath(caseRoot);
  await rm(caseRoot, { recursive: true, force: true });
  await mkdir(join(caseRoot, "src", "components"), { recursive: true });

  const extension = framework === "vue" ? "vue" : "svelte";
  const componentName = workload === "counter" ? "CounterWorkload" : "TodoWorkload";

  await writeGenerated(
    join(caseRoot, "src", `App.${extension}`),
    appSource(framework, workload, count),
  );

  for (let index = 0; index < count; index += 1) {
    await writeGenerated(
      join(
        caseRoot,
        "src",
        "components",
        `${componentName}${index}.${extension}`,
      ),
      componentSource(framework, workload, index),
    );
  }

  if (lane === "ssr") {
    await writeGenerated(
      join(caseRoot, "src", "server.js"),
      serverEntry(framework),
    );
  } else {
    await writeGenerated(
      join(caseRoot, "src", "main.js"),
      clientEntry(framework, lane),
    );
    await writeGenerated(
      join(caseRoot, "index.html"),
      `<!doctype html>
<html lang="en">
  <head><meta charset="UTF-8"><title>Bundle scaling</title></head>
  <body><div id="app"></div><script type="module" src="/src/main.js"></script></body>
</html>
`,
    );
  }

  return caseRoot;
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

async function measureCase(input) {
  const caseRoot = await generateCase(input);
  const outDir = join(caseRoot, "dist");
  const plugins =
    input.framework === "vue"
      ? [vue()]
      : [svelte({ compilerOptions: { dev: false } })];

  const commonBuild = {
    target: "es2022",
    minify: "oxc",
    sourcemap: false,
    reportCompressedSize: false,
    emptyOutDir: true,
    outDir,
  };

  await build({
    root: caseRoot,
    configFile: false,
    logLevel: "error",
    plugins,
    build:
      input.lane === "ssr"
        ? {
            ...commonBuild,
            ssr: join(caseRoot, "src", "server.js"),
            rollupOptions: {
              output: {
                entryFileNames: "server.js",
              },
            },
          }
        : commonBuild,
    ssr: input.lane === "ssr" ? { noExternal: true } : undefined,
  });

  const jsFiles = await listJavaScriptFiles(outDir);
  const files = [];
  const totals = { raw: 0, gzip: 0, brotli: 0 };

  for (const filename of jsFiles) {
    const buffer = await readFile(filename);
    const sizes = compressedSizes(buffer);
    files.push({
      file: relative(outDir, filename),
      ...sizes,
    });
    totals.raw += sizes.raw;
    totals.gzip += sizes.gzip;
    totals.brotli += sizes.brotli;
  }

  return {
    ...input,
    files,
    ...totals,
  };
}

function linearFit(points, metric) {
  const n = points.length;
  const sumX = points.reduce((sum, point) => sum + point.count, 0);
  const sumY = points.reduce((sum, point) => sum + point[metric], 0);
  const sumXX = points.reduce(
    (sum, point) => sum + point.count * point.count,
    0,
  );
  const sumXY = points.reduce(
    (sum, point) => sum + point.count * point[metric],
    0,
  );
  const denominator = n * sumXX - sumX * sumX;
  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  return { intercept, slope };
}

function sampledCrossover(vuePoints, sveltePoints, metric) {
  const samples = vuePoints.map((vuePoint, index) => ({
    count: vuePoint.count,
    delta: vuePoint[metric] - sveltePoints[index][metric],
  }));

  for (let index = 1; index < samples.length; index += 1) {
    const previous = samples[index - 1];
    const current = samples[index];
    if (previous.delta > 0 && current.delta <= 0) {
      const distance = current.count - previous.count;
      const deltaDistance = previous.delta - current.delta;
      return (
        previous.count + distance * (previous.delta / deltaDistance)
      );
    }
  }

  return null;
}

function crossoverDescription(vuePoints, sveltePoints, metric) {
  const crossover = sampledCrossover(vuePoints, sveltePoints, metric);
  return crossover === null ? "none sampled" : `≈ ${decimal(crossover)}`;
}

function bytes(value) {
  return `${value.toLocaleString("en-US")} B`;
}

function decimal(value) {
  return value.toFixed(1);
}

function generateReport(results, metadata) {
  const lines = [
    "# Vue 3.5 and Svelte 5 Bundle-Scaling Results",
    "",
    `Generated: ${metadata.generatedAt}`,
    "",
    `- Node: ${metadata.node}`,
    `- Vite: ${metadata.versions.vite}`,
    `- Vue: ${metadata.versions.vue}`,
    `- Svelte: ${metadata.versions.svelte}`,
    `- Vue plugin: ${metadata.versions.vuePlugin}`,
    `- Svelte plugin: ${metadata.versions.sveltePlugin}`,
    "- Minifier: Vite 8 Oxc production minification",
    "- Compression: gzip level 9 and Brotli quality 11",
    "",
    "The tables below report the total Brotli-compressed JavaScript emitted by",
    "each production build. Positive deltas mean the Vue bundle is larger;",
    "negative deltas mean the Vue bundle is smaller.",
    "",
  ];

  for (const workload of workloads) {
    for (const lane of lanes) {
      const vuePoints = results.filter(
        (result) =>
          result.framework === "vue" &&
          result.workload === workload &&
          result.lane === lane,
      );
      const sveltePoints = results.filter(
        (result) =>
          result.framework === "svelte" &&
          result.workload === workload &&
          result.lane === lane,
      );
      const vueFitPoints = vuePoints.filter((point) => point.count >= 1);
      const svelteFitPoints = sveltePoints.filter((point) => point.count >= 1);
      const vueFit = linearFit(vueFitPoints, "brotli");
      const svelteFit = linearFit(svelteFitPoints, "brotli");
      const crossover = sampledCrossover(vuePoints, sveltePoints, "brotli");

      lines.push(`## ${workload}: ${lane}`, "");
      lines.push("| Distinct components | Vue | Svelte | Vue − Svelte |");
      lines.push("| ---: | ---: | ---: | ---: |");

      for (let index = 0; index < vuePoints.length; index += 1) {
        const vuePoint = vuePoints[index];
        const sveltePoint = sveltePoints[index];
        const delta = vuePoint.brotli - sveltePoint.brotli;
        lines.push(
          `| ${vuePoint.count} | ${bytes(vuePoint.brotli)} | ${bytes(sveltePoint.brotli)} | ${delta >= 0 ? "+" : ""}${bytes(delta)} |`,
        );
      }

      lines.push(
        "",
        `Descriptive linear fit from 1 through ${componentCounts.at(-1)} components: Vue ≈ ${decimal(vueFit.intercept)} + ${decimal(vueFit.slope)} bytes/component; Svelte ≈ ${decimal(svelteFit.intercept)} + ${decimal(svelteFit.slope)} bytes/component.`,
        "",
      );

      if (crossover === null) {
        lines.push(
          "No Vue-from-larger-to-smaller crossover appeared within the sampled component counts.",
          "",
        );
      } else {
        lines.push(
          `Linear interpolation between sampled points places the observed crossover near ${decimal(crossover)} distinct components. This is descriptive of this workload and toolchain, not a universal threshold.`,
          "",
        );
      }

      lines.push(
        "### Growth by size metric",
        "",
        "| Metric | Vue bytes/component | Svelte bytes/component | Observed Vue crossover |",
        "| --- | ---: | ---: | --- |",
      );

      for (const metric of ["raw", "gzip", "brotli"]) {
        const vueMetricFit = linearFit(vueFitPoints, metric);
        const svelteMetricFit = linearFit(svelteFitPoints, metric);
        lines.push(
          `| ${metric} | ${decimal(vueMetricFit.slope)} | ${decimal(svelteMetricFit.slope)} | ${crossoverDescription(vuePoints, sveltePoints, metric)} |`,
        );
      }

      lines.push("");
    }
  }

  lines.push(
    "## Compression diagnostic",
    "",
    "The repeated-component cases become progressively easier to compress. This",
    "table reports Brotli size as a percentage of raw JavaScript for CSR builds;",
    "a falling percentage means repetition is contributing more of the apparent",
    "bundle-size efficiency.",
    "",
    "| Workload | Components | Vue | Svelte |",
    "| --- | ---: | ---: | ---: |",
  );
  for (const workload of workloads) {
    for (const count of [1, 20, 80, 640]) {
      const vuePoint = results.find(
        (result) =>
          result.framework === "vue" &&
          result.workload === workload &&
          result.lane === "csr" &&
          result.count === count,
      );
      const sveltePoint = results.find(
        (result) =>
          result.framework === "svelte" &&
          result.workload === workload &&
          result.lane === "csr" &&
          result.count === count,
      );
      lines.push(
        `| ${workload} | ${count} | ${(100 * vuePoint.brotli / vuePoint.raw).toFixed(1)}% | ${(100 * sveltePoint.brotli / sveltePoint.raw).toFixed(1)}% |`,
      );
    }
  }
  lines.push(
    "",
    "At high counts these near-cloned components compress far more effectively",
    "than heterogeneous production code should be assumed to compress. The raw",
    "curve and the compressed curve therefore bound different questions; neither",
    "is a standalone prediction for a real application.",
    "",
  );

  lines.push(
    "## Interpretation",
    "",
    "Read these measurements with the methodology and limitations in `README.md`.",
    "The CSR and hydration lanes are browser-transfer comparisons. The SSR lane",
    "measures a bundled server artifact and is included only to examine generated",
    "server code. Exact thresholds are workload-sensitive and should not be",
    "presented as permanent properties of either framework.",
    "",
  );

  return `${lines.join("\n").trimEnd()}\n`;
}

async function main() {
  await rm(workRoot, { recursive: true, force: true });
  await mkdir(workRoot, { recursive: true });

  const results = [];
  const totalCases =
    frameworks.length *
    workloads.length *
    lanes.length *
    componentCounts.length;
  let completed = 0;

  for (const workload of workloads) {
    for (const lane of lanes) {
      for (const count of componentCounts) {
        for (const framework of frameworks) {
          const input = { framework, workload, lane, count };
          const result = await measureCase(input);
          results.push(result);
          globalThis.gc?.();
          completed += 1;
          if (process.stdout.isTTY) {
            process.stdout.write(
              `\rMeasured ${completed}/${totalCases}: ${framework} ${workload} ${lane} ${count}`,
            );
          } else if (completed % 20 === 0 || completed === totalCases) {
            process.stdout.write(`Measured ${completed}/${totalCases}\n`);
          }
        }
      }
    }
  }
  if (process.stdout.isTTY) process.stdout.write("\n");

  const metadata = {
    generatedAt: new Date().toISOString(),
    node: process.version,
    platform: `${process.platform}-${process.arch}`,
    componentCounts,
    versions: {
      vite: packageJson.dependencies.vite,
      vue: packageJson.dependencies.vue,
      svelte: packageJson.dependencies.svelte,
      vuePlugin: packageJson.dependencies["@vitejs/plugin-vue"],
      sveltePlugin:
        packageJson.dependencies["@sveltejs/vite-plugin-svelte"],
      vueServerRenderer:
        packageJson.dependencies["@vue/server-renderer"],
    },
  };

  await writeFile(
    join(benchmarkRoot, "results.json"),
    `${JSON.stringify({ metadata, results }, null, 2)}\n`,
  );
  await writeFile(
    join(benchmarkRoot, "results.md"),
    generateReport(results, metadata),
  );

  if (process.env.KEEP_BENCH_WORK !== "1") {
    await rm(workRoot, { recursive: true, force: true });
  }
}

if (process.argv.includes("--report-only")) {
  const saved = JSON.parse(
    await readFile(join(benchmarkRoot, "results.json"), "utf8"),
  );
  await writeFile(
    join(benchmarkRoot, "results.md"),
    generateReport(saved.results, saved.metadata),
  );
} else {
  await main();
}
