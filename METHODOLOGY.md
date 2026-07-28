# Methodology

## Research question

The benchmark tests two related claims:

1. Does current Vue still produce less application-specific client code per
   component than current Svelte?
2. If so, can that lower growth repay Vue’s larger shared runtime after
   production minification, code splitting, and HTTP compression?

The second question cannot be answered by compiling one component. A browser
receives a complete entry graph, and route chunks are separate compressed
responses. The harness therefore moves from isolated compiler output to
complete, code-split applications while preserving the limitations of every
lane.

This is a bundle-size study, not a general framework benchmark.

## Toolchain

The committed results use:

| Tool | Version |
| --- | --- |
| Node.js | 22.19.0 |
| Vite | 8.1.5 |
| Vue | 3.5.40 |
| Svelte | 5.56.8 |
| `@vitejs/plugin-vue` | 6.0.8 |
| `@sveltejs/vite-plugin-svelte` | 7.2.0 |
| Playwright (parity only) | 1.62.0 |

`package.json` and `package-lock.json` pin exact versions for the benchmark
harness and newly authored fixtures. Commit-pinned independent controls retain
their own dependency graphs; their resolved versions are recorded in their
result documents.

The controlled compiler and generated-application lanes target ES2022, use
Vite’s Oxc production minifier, omit source maps, and disable Vite’s own
display-only compressed-size calculation. Real-application controls use their
documented production configurations. OpenSlides targets `esnext` and uses
Terser in both implementations. The harness reads the emitted assets itself.

The primary reports use the official plugin defaults. The route-split
application simulation and hand-authored lane also have an app-informed
trimmed profile:

- Vue sets `features.optionsAPI` to `false`, because those fixtures exclusively
  use Composition API and `<script setup>`;
- Svelte sets `compilerOptions.discloseVersion` to `false`.

These are supported production settings, not source transformations or
hand-deleted runtime code. The historical specimen and externally maintained
matched application remain on defaults because preserving their source and
compatibility assumptions is more important than applying an app-specific
trim.

## Size definitions

For each emitted file:

- **raw** is the emitted byte length;
- **gzip** is Node’s `gzipSync` output at level 9;
- **Brotli** is Node’s `brotliCompressSync` output at quality 11.

For a single-bundle build, the total is that file’s size. For a code-split
build, each file is compressed independently and the resulting lengths are
summed. This matches ordinary transfer accounting because each HTTP response
has its own compressed representation.

The route-split application simulation and hand-authored lane also concatenate
all emitted JavaScript and compress it once. This **coalesced** number is not a
network total. It is a diagnostic for repeated syntax that would share one
compression dictionary if the application were a single response.

The compiler, generated scaling, matched benchmark, and hand-authored lanes
measure JavaScript only. Weather Front and Terminal measure emitted JavaScript
and CSS. OpenSlides measures every JavaScript, CSS, and Wasm response requested
by its production dashboard and editor journeys. HTML, HTTP headers, source
maps, images, and cached bytes are excluded. Each report labels its asset
scope.

## Transfer scopes

A code-split application has three different bundle-size questions:

```text
cold initial route
shared runtime + application entry + initial route chunks

continued navigation
+ each newly loaded feature chunk

complete cold traversal
the union of every JavaScript response loaded across all sampled routes
```

The route-split application simulation reports a complete cold traversal. It
counts each independently compressed JavaScript response once, matching a
session that eventually visits every sampled route with an initially empty
cache. It does not assume that building a route makes every user download it.

Already loaded modules are reused during a running application. Unchanged
content-hashed assets may also be reused across visits when deployment cache
headers permit it. Both frameworks receive that benefit. A new deployment,
cache eviction, private session, or different device can restore the cold
cost.

The reports therefore keep initial transfer, individual lazy responses,
complete cold traversal, and coalesced compression separate. “Bundle size” is
not one number until the delivery and navigation model is specified.

## Complementary benchmark lanes

### 1. Original 2021 specimen

`scripts/run-original-specimen.mjs` downloads the exact `todomvc.vue` and
`todomvc.svelte` files from Evan You’s repository at commit
`7bb60ff681a3f5016e8af26084e72100cd37a876`.

The Vue source requires one compatibility migration:
`@vnode-mounted` becomes `@vue:mounted`. The Svelte source is unchanged. Both
components are compiled as externalized ES modules so framework imports are
not bundled. Shared import/export syntax is removed for the reported
component-only measurement.

The same sources are also mounted as complete CSR and hydration-capable
applications. Those totals include each framework’s browser runtime. This
separates “what did the component compiler emit?” from “what did the browser
receive?”

The lane preserves a historical specimen, including legacy Svelte syntax. It
does not claim to compare ideal new code in either framework.

### 2. Controlled definition scaling

`scripts/run-benchmark.mjs` creates complete applications with 0, 1, 2, 5, 10,
20, 40, 80, 160, 320, and 640 distinct component modules. It does not render
one imported component hundreds of times; that would pay for only one
definition.

Two component shapes are generated:

- a counter with local and derived state, conditional output, a dynamic class,
  and event handlers;
- a TodoMVC-style component with input, filtering, keyed lists, bindings,
  derived counts, dynamic classes, and add/remove/filter behavior.

Each shape is built in three lanes:

- **CSR:** browser client mount;
- **hydrate:** browser client capable of hydrating server-rendered HTML;
- **SSR:** bundled server-rendering program.

The SSR result is not browser transfer and is never compared to the CSR result
as though they served the same purpose.

Linear fits summarize sampled growth after one component has activated the
relevant runtime features. They are descriptive fits, not framework constants.

### 3. Route-split application simulation

This repository calls the generated fixture built by
`scripts/run-route-split.mjs` the **route-split application simulation**. It is
a browser-runnable application benchmark, not TodoMVC or the hand-authored
product application. It reduces the pathological repetition in the controlled
lane by generating eight behavior families—counter, disclosure, tabs, task
tracker, search, settings, pagination, and notifications—and placing one of
each into every lazy route.

It builds 0–512 definitions in route groups of eight. Each emitted JavaScript
file is compressed separately before the complete transfer is summed.

This lane asks whether Vue’s lower generated-code growth can survive a chunk
graph that prevents one global Brotli dictionary. Because the components are
still generated from eight templates, its crossover is evidence that the
mechanism can occur, not a prediction for a product.

### 4. Independently maintained matched application

`scripts/run-matched-app.mjs` downloads the keyed Vue and Svelte implementations
from `js-framework-benchmark` at commit
`6bd71fcab935b7e4c627b7c394a86633fcd8feea`.

Both are built with this repository’s Vite configuration. The only
normalization replaces Svelte’s Rollup-oriented `dist/main.js` HTML reference
with a Vite module entry to its existing `src/main.js`. Application source is
otherwise unchanged.

This lane avoids authoring the comparison toward either framework, but it is a
small performance benchmark rather than a substantial product.

### 5. Hand-authored product application

The framework-neutral [fixture specification](fixtures/hand-authored/SPEC.md)
was written before either implementation was measured. It defines eight
research-workspace routes with three distinct leaf components each:

Dashboard, Search, Records, Reader, Editor, Settings, Notifications, and
Library.

Dashboard is initial; every other route is lazy. Builds contain the first 1, 2,
4, or 8 routes, yielding 5, 9, 17, or 33 component definitions including the
application and route shells.

The full Vue and Svelte applications expose the same labels, initial data,
test identifiers, and visible state transitions. The same Playwright test
performs interactions across every route and every leaf component in both
applications. A result is not publishable if either implementation fails.

Playwright and Chromium are parity tools only. The benchmark script invokes
Vite directly, reads `dist`, and performs compression in Node. Browser
binaries, test code, and test dependencies cannot enter the measured graphs.

### 6. Small real-application controls

The normalized Weather Front fixture implements the same six-component product
surface in current Vue and Svelte. A shared Playwright contract verifies the
visible behavior before its emitted JavaScript and CSS responses are measured.

The Terminal control preserves the independently authored Vue and Svelte
implementations from
[`naufalafif/realworld-js-framework-comparison`](https://github.com/naufalafif/realworld-js-framework-comparison/tree/2c338de860222deba6b842260cfbec6609c272bd).
`scripts/run-terminal-control.mjs` checks out that exact source commit, installs
its locked dependency graph, builds both plain Vite applications, and measures
their emitted JavaScript and CSS. The Vue application uses Composition API
only, so its unused Options API and production diagnostics are disabled. The
source commit, resolved dependencies, and production asset measurements are
recorded in `results/terminal-control.json`.

These controls establish that Svelte retains its baseline advantage in two
complete small applications. They do not locate a universal crossover.

### 7. Medium-sized OpenSlides application

The OpenSlides lane pins the upstream Svelte application at commit
[`a8138eb`](https://github.com/codewiththiha/OpenSlides/tree/a8138eb26c93df378119147c036c34fe7d83b6a7)
and compares it with a Vue port of the same product. Both implementations
lazy-load dashboard and editor routes and pass the same nine Playwright
workflows.

The browser records every production JavaScript, CSS, and Wasm response needed
to make the dashboard usable and then open the seeded editor. It counts each
content-hashed response once. This measures two complete implementations rather
than framework-runtime bytes in isolation.

The implementations are behavior-matched, not source-shape-matched. They use
different framework-specific UI adapters and organize components differently.

The original Svelte source used worker-side Shiki for dashboard previews and
main-thread Shiki for the editor transition, causing the browser to request
two engine, language, and theme sets during the measured journey. The Vue port
requested one set. The Svelte audit introduced an explicit execution policy so
the dashboard and initial editor state reuse one main-thread set. The smaller,
corrected Svelte measurement is canonical; the original duplicated result is
documented in the README as an application gotcha.

## Fixture-authoring audit

The current-source Svelte fixtures were checked against
[Svelte’s official best
practices](https://svelte.dev/docs/svelte/best-practices). They use Svelte 5
runes, `$derived` for computed state, current event attributes, keyed changing
lists, and direct dynamic components. All 33 hand-authored Svelte components
compile without a Svelte warning.

The audit also made the following matched corrections:

- six Svelte `class:` directives became the currently recommended
  object-valued `class` form;
- an unmatched no-op Vue `watch` was removed;
- one replace-only collection uses shallow state in both implementations:
  `shallowRef` in Vue and `$state.raw` in Svelte.

The OpenSlides Svelte source was separately checked with `svelte-check`,
ESLint, Knip, and Svelte’s official autofixer across all 99 component files.
The actionable findings replaced two effect-synchronized prop mirrors with
writable `$derived` state, migrated two context modules to `createContext`,
and removed the duplicate Shiki transfer described above. The state and
context changes were transfer-size neutral; the Shiki correction materially
reduced the canonical Svelte result.

The Svelte class change added 114 B of Brotli to the complete hand-authored
application rather than reducing it. It remains because the canonical fixture
follows current documented source instead of selecting syntax by benchmark
outcome. The complete audit record is in
[`docs/ai-research/20260727-svelte-fixture-optimization-audit/`](docs/ai-research/20260727-svelte-fixture-optimization-audit/).

## Why compression changes the answer

Suppose Vue has a larger fixed runtime but adds fewer raw bytes per component:

```text
Vue:    large shared baseline + n × smaller generated increment
Svelte: small shared baseline + n × larger generated increment
```

That model can describe raw output while failing to predict transfer size.
Repeated generated code is highly compressible, and the compressor works on
the actual response—not on a theoretical per-component cost.

Two opposite mistakes follow:

1. Compress one component and multiply its compressed length. This assumes
   every component pays for a fresh compression dictionary.
2. Clone one component hundreds of times and compress the entire application
   once. This gives every clone access to a global dictionary with nearly
   identical syntax.

The harness reports both raw and per-response compressed results, introduces
structural variety, and preserves lazy boundaries. It does not pretend those
controls reproduce every real chunk graph.

## Reproducibility and integrity

`npm run benchmark:all` regenerates the controlled lanes, trimmed profiles,
Weather Front measurements, the independently authored Terminal control, and
OpenSlides results.
Temporary build roots are cleared before use and removed after successful runs.
Upstream inputs are commit-pinned. Lanes that download individual source files
also record their SHA-256 digests in the generated JSON.

`npm run verify`:

- validates that every byte count is a non-negative safe integer;
- recomputes totals from the emitted-file records;
- validates initial/static-import totals in the hand-authored lane;
- validates coalesced/raw invariants;
- checks harness-owned build versions against `package.json`;
- computes canonical SHA-256 hashes for all committed result documents.

Canonicalization sorts object keys and omits only environmental metadata:
generation timestamp, reported Node version, and operating-system platform.
Asset names, measurements, upstream commits, migrations, component counts, and
tool versions remain hashed.

Two consecutive full runs on the authoring machine reproduced all committed
measurements. The manual GitHub Actions reproduction workflow is configured to
run the same complete matrix; the pull-request workflow runs parity, both
current-source application profiles, chart generation, and result
verification.

## Threats to validity

- Bundle size is only one engineering variable.
- Generated components repeat source shapes even when their values differ.
- The hand-authored fixture is intentionally dependency-free and smaller than
  a long-lived product.
- Different routing, manual chunks, target browsers, minifiers, framework
  options, or deployment compression can change the result.
- Tree-shaking rewards code that is unused by the chosen specimen.
- Component count is not a stable measure of application complexity.
- Initial transfer and complete cold traversal answer different product
  questions.
- Behavior parity does not make two framework implementations source-shape or
  dependency-graph equivalents.
- Framework-specific libraries and optional assets can be larger than the
  framework runtime itself.
- A framework upgrade can change every result.
- Server bundle size is operationally different from browser transfer.

The repository establishes that Svelte’s smaller framework baseline does not
guarantee a smaller substantial application. It supports a practical
crossover rule of thumb and reproducible examples, not one universal numerical
threshold.
