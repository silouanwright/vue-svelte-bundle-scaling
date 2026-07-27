# Vue–Svelte Size Analysis, Revisited for 2026

## TL;DR

- Svelte is the likely bundle-size winner for Hello World demos, isolated
  widgets, and small applications.
- Vue is likely to become smaller for medium-to-large applications as its
  shared runtime is amortized across more components, features, and routes.

![Svelte is smaller for the Weather Front and terminal applications, while Vue is substantially smaller for the medium-sized OpenSlides application](docs/images/real-applications-brotli.svg)

## Why this benchmark exists

In paraphrase, Svelte advocates argue the following:

- “Svelte avoids the upfront cost of a large framework runtime by compiling
  components into tiny standalone modules.” — Rich Harris, Svelte creator, now
  at Vercel,
  ([*Frameworks without the
  framework*](https://web.archive.org/web/20260727134238/https://svelte.dev/blog/frameworks-without-the-framework))
- “Svelte began as an experiment in making JavaScript bundles as small and fast
  as possible, based on the belief that compiler magic could remove the need to
  worry about shipping too much JavaScript.” — Rich Harris, Svelte creator, now
  at Vercel,
  ([*The Undefined: Vue vs. Svelte with Evan You and Rich Harris*,
  19:10](https://web.archive.org/web/20260727160325/https://undefined.fm/radio/vue-vs-svelte-with-evan-you-and-rich-harris))
- “Moving more framework work into the compiler is what makes Svelte
  applications small and fast.” — The Svelte team, Svelte, ([*Svelte 5 is
  alive*](https://web.archive.org/web/20260727134144/https://svelte.dev/blog/svelte-5-is-alive))
- “The framework largely disappears before the browser loads the page, so
  users receive mostly application code.” — Anshuman Bhardwaj, Vercel,
  ([*What is
  Svelte?*](https://web.archive.org/web/20260727134258/https://vercel.com/i/what-is-svelte))
- “Svelte produces a smaller JavaScript payload than Vue because Vue sends more
  framework logic to the browser.” — Anshuman Bhardwaj, Vercel,
  ([*How Svelte compares with other
  frameworks*](https://web.archive.org/web/20260727134258/https://vercel.com/i/what-is-svelte#how-svelte-compares-with-other-frameworks))
- “Equivalent Svelte bundles are roughly half the size of Vue bundles, and the
  absolute gap remains as applications grow.” — PkgPulse Team, PkgPulse,
  ([*Vue 3 vs. Svelte
  5*](https://web.archive.org/web/20260727134421/https://www.pkgpulse.com/guides/vue-3-vs-svelte-5-2026#bundle-size))
- “A small Vue build can be about ten times larger than its Svelte equivalent.”
  — Arek Nawo, ButterCMS, ([*Svelte vs.
  Vue*](https://web.archive.org/web/20260727134449/https://buttercms.com/blog/svelte-vs-vue-which-one-to-choose/#bundle-size))

## Vue amortization

Vue pays more upfront for its shared runtime. If each additional Vue component
contributes less generated code than its Svelte counterpart, enough components
eventually repay that initial difference. That is amortization.

In 2021, Vue creator Evan You responded to this underlying claim with
[benchmarks](https://github.com/yyx990803/vue-svelte-size-analysis)
showing that while Svelte had a dramatically smaller framework baseline, Vue
generated substantially less component-specific code for one TodoMVC
component. He then calculated that roughly 19 TodoMVC-sized components could
repay Vue’s larger runtime. That was a model of a larger application, not a
measured complete application containing 19 components.

The architectural tradeoff is also clearly documented in the Vue FAQ:
[https://vuejs.org/about/faq#is-vue-lightweight](https://vuejs.org/about/faq#is-vue-lightweight).

## Is Vue amortization still visible in 2026?

Yes. Weather Front and the independent terminal app establish the small end
honestly: Svelte wins both. OpenSlides supplies what Evan You hypothesized from
TodoMVC: an actual, working medium-sized application that
concretely shows Vue becoming substantially smaller.

The lead chart therefore uses measured production builds from working
applications, not projected copies of one TodoMVC component.

Svelte starts smaller. Vue grows more slowly. The exact crossover varies by
application, but a smaller framework baseline does not guarantee a smaller
substantial application.

## Updated packages for the 2026 benchmark

- Vue 3.5.40
- Svelte 5.56.8
- Vite 8.1.5
- `@vitejs/plugin-vue` 6.0.8
- `@sveltejs/vite-plugin-svelte` 7.2.0
- Node.js 22.19.0

The newly authored Svelte fixtures use idiomatic Svelte 5 and follow
[Svelte’s documented best
practices](https://svelte.dev/docs/svelte/best-practices). The historical
replication separately preserves Evan You’s original sources.

## New statistics for the 2026 benchmark

- Component-only output and complete production bundles
- Raw, gzip, and Brotli sizes
- CSR, hydration, and SSR output
- Initial-route, lazy-route, and complete-traversal transfer
- Marginal bytes per component and estimated crossover points
- Generated scaling workloads and independently authored application controls
- Default and app-informed trimmed production profiles

That is the overview. To reproduce the results, jump to
[`Run the benchmarks`](#run-the-benchmarks).

If you want the case studies and technical evidence, read on.

## OpenSlides: the primary 2026 case study

Evan You projected the crossover from one TodoMVC component. To measure the
same principle in a substantial application, I ported the frontend of
[`codewiththiha/OpenSlides`](https://github.com/codewiththiha/OpenSlides), an
MIT-licensed desktop application for building animated code presentations,
from Svelte 5 to Vue 3. The source is pinned at commit
[`a8138eb`](https://github.com/codewiththiha/OpenSlides/tree/a8138eb26c93df378119147c036c34fe7d83b6a7).

OpenSlides is a credible medium-sized application. Its Svelte frontend has 99
components and approximately 18,700 lines of TypeScript, JavaScript, CSS, and
Svelte source. It includes project and slide management, drag-and-drop stacks,
search, syntax highlighting, Magic Move transitions, highlight steps,
presentation mode, autoplay, settings, and a Tauri persistence boundary.

The Vue port uses the same Tauri command contract, Shiki release,
byte-identical Shiki worker, business types, themes, styles, and production
settings. Both implementations lazy-load the dashboard and editor as separate
route chunks. A shared Playwright suite runs the same dashboard, editor,
persistence, grouping, search, settings, presentation, and autoplay behaviors
against both versions. The complete scope is recorded in the
[`parity ledger`](fixtures/openslides/PARITY.md), and the contract itself is
[`tests/openslides-parity.spec.mjs`](tests/openslides-parity.spec.mjs).

### Vue leads after the first user-visible route

A cold production browser first opens the dashboard, then opens the editor.
Vue is smaller at both user-visible stages:

| OpenSlides cold production journey | Vue 3.5 | Svelte 5 | Smaller result |
| --- | ---: | ---: | --- |
| Dashboard, gzip | 418.966 kB | 541.648 kB | Vue by 122.682 kB |
| Dashboard, Brotli | 309.676 kB | 413.089 kB | Vue by 103.413 kB |
| Dashboard through editor, gzip | 510.251 kB | 889.338 kB | Vue by 379.087 kB |
| Dashboard through editor, Brotli | 389.076 kB | 656.812 kB | Vue by 267.736 kB |

Route splitting therefore does not rescue the universal bundle-size claim.
Neither implementation charges the dashboard user for the editor route, yet
Vue is already smaller when that first route becomes usable.

### Compression does not create Vue’s lead

The Brotli chart answers the practical network question: how many bytes does
the user download? The same four measurements before transfer compression
answer a complementary question: how much production output did each build
emit?

![Svelte emits less uncompressed production output for Weather Front and Terminal, while Vue emits substantially less for OpenSlides](docs/images/real-applications-raw.svg)

*At the final OpenSlides state, Vue emits 1.810 MB and Svelte emits 3.216 MB
before compression—a 1.406 MB difference. Svelte actually compresses that
output slightly more efficiently: its Brotli result is 20.4% of raw output,
versus 21.5% for Vue. Vue still transfers 267.736 kB less. The reversal is
therefore present in the emitted production output, not created by Brotli.*

The cold journey includes every production JavaScript, CSS, worker, language,
theme, and Shiki Wasm asset actually requested at each stage. Both
implementations request two Shiki asset sets after the editor opens. These are
real application costs, but they are not pure measurements of framework
runtime bytes.

That distinction matters. OpenSlides proves that a medium-sized Vue
application can be smaller than its behavior-matched Svelte counterpart. It
also shows that the result survives matched route splitting. It does not
establish a universal route number, component count, or source-line threshold
at which every application will cross.

The two implementations are behavior-matched, not line-for-line translations.
Nine shared Playwright workflows—18 passing cases across the two
implementations—cover every material product claim in the parity ledger. Vue
uses 27 larger component files and roughly 8,800 total source lines; Svelte
uses 99 components plus smaller rune and controller modules across roughly
18,800 lines. That difference is part of how the two applications were
credibly authored, but it also means this case study does not isolate runtime
bytes in a laboratory. It proves something narrower and still important: a
serious Vue implementation can be substantially smaller than the Svelte
application it replaces.

The complete requested-file inventory and reproduction command are in
[`results/openslides.md`](results/openslides.md).

## Small-app controls

The two small-app points in the lead chart are working applications, and both
favor Svelte:

| Brotli transfer | Vue 3.5 | Svelte 5 | Smaller result |
| --- | ---: | ---: | --- |
| Weather Front | 24.003 kB | 16.138 kB | Svelte by 7.865 kB |
| Terminal | 86.265 kB | 77.671 kB | Svelte by 8.594 kB |

Weather Front uses matched Vue and Svelte implementations of the same product
surface. Terminal reproduces an
[independent comparison](https://github.com/naufalafif/realworld-js-framework-comparison/tree/2c338de860222deba6b842260cfbec6609c272bd).
Together they establish the left side of the chart: Svelte starts smaller.

Synthetic scaling tests, the historical TodoMVC reproduction, complete
small-app measurements, and every machine-readable artifact are indexed in
[`results/`](results/README.md). Interpretation and limitations live in
[`docs/analysis.md`](docs/analysis.md); the transfer model is documented in
[`METHODOLOGY.md`](METHODOLOGY.md).

## Run the benchmarks

Requirements:

- Node.js 22.19.0 (also recorded in `.nvmrc`)
- npm
- network access for the two commit-pinned upstream specimen lanes
- Chromium for the OpenSlides browser-transfer benchmark and behavior-parity
  tests

Install exactly the locked dependency graph:

```bash
npm ci
```

Run every benchmark lane:

```bash
npm run benchmark:all
npm run verify
```

Run one lane:

```bash
npm run benchmark:original
npm run benchmark
npm run benchmark:route-split
npm run benchmark:matched-app
npm run benchmark:hand-authored
npm run benchmark:optimization-sensitivity
npm run benchmark:weather-upstream
npm run benchmark:weather-staged
npm run benchmark:openslides
```

Generate the committed charts:

```bash
npm run charts
```

Run the shared behavior contracts:

```bash
npx playwright install chromium
npm test
npm run test:weather-parity
npm run test:openslides-parity
```

Playwright runs headlessly against both complete fixtures and performs the same
interactions so that unlike behavior cannot be rewarded with a smaller result.
The browser and test code are development-only dependencies and never enter a
measured bundle.

## License

The benchmark harness and original fixtures in this repository are available
under the [MIT License](LICENSE). The committed OpenSlides specimen and Vue
port retain the upstream project’s
[MIT license](fixtures/openslides/svelte/LICENSE). Other fetched upstream
specimens retain their respective licenses and are not committed here.
