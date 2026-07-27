# Vue–Svelte Size Analysis, Revisited for 2026

## TL;DR

- Svelte is the likely bundle-size winner for Hello World demos, isolated
  widgets, and small initial routes.
- Vue’s larger runtime can be repaid as an application grows. In this
  repository’s route-split application simulation, Vue becomes smaller after
  enough lazy routes are loaded.

![In the route-split application simulation, Svelte starts smaller while Vue eventually transfers less JavaScript](docs/images/route-split-brotli.svg)

*This is the route-split application simulation: a generated, browser-runnable
benchmark with eight interactive component families per lazy route. It is not
TodoMVC or the separately authored product-shaped application. The chart plots
each framework against its own source-line count; its estimated 1.6k-line
intersection is illustrative, while the matched-functionality Brotli result
crosses near 243 component definitions.*

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

In this context, amortization means paying a larger shared framework cost once,
then offsetting it by generating less code for each additional component.

In 2021, Vue creator Evan You responded to this underlying claim with
[benchmarks](https://github.com/yyx990803/vue-svelte-size-analysis)
showing that while Svelte had a dramatically smaller framework baseline, Vue
generated substantially less component-specific code. He concluded that
Svelte provided a compelling advantage for isolated components, but that its
generated-code cost could become a disadvantage for medium-to-large
applications. This is also clearly documented in the Vue FAQ:
[https://vuejs.org/about/faq#is-vue-lightweight](https://vuejs.org/about/faq#is-vue-lightweight).

Evan’s specimen was one TodoMVC component. Vue generated less
component-specific code for it, but Svelte still had the smaller complete
application after its runtime was included. Evan then used those measurements
to estimate when Vue’s larger shared runtime could be repaid; he did not build
a larger TodoMVC application and measure a complete-bundle crossover.

## Is this still true in 2026?

Yes. Vue still generates less component-specific code in the historical
specimen, and the route-split application simulation demonstrates the
amortization mechanism in complete, independently compressed production
bundles.

I put together this updated study to build on and expand Evan You’s original
comparison five years later, using a current toolchain and broader benchmarks.

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
TodoMVC lane deliberately preserves Evan You’s legacy Svelte source.

## New statistics for the 2026 benchmark

- Component-only output and complete production bundles
- Raw, gzip, and Brotli sizes
- CSR, hydration, and SSR output
- Initial-route, lazy-route, and complete-traversal transfer
- Marginal bytes per component and estimated crossover points
- Generated scaling workloads and independently authored application controls
- Default and app-informed trimmed production profiles

The extended interpretation and limitations live in
[`analysis.md`](analysis.md). The exact workloads, controls, and transfer model
live in [`METHODOLOGY.md`](METHODOLOGY.md).

## Route-split application simulation

The route-split application simulation is a generated, browser-runnable
benchmark—not TodoMVC and not a production product. Its application shell
lazily loads routes. Each route contains one counter, disclosure, tabs panel,
task tracker, search panel, settings form, pagination control, and notification
panel.

The clearest comparison is the same simulation at two sizes. With one route
and eight component definitions, Svelte is smaller. After the
simulation expands to 64 routes and 512 component definitions, Vue is
smaller. Both measurements include the framework runtime and every route
response loaded during a complete traversal.

| Complete application transfer | Vue 3.5 | Svelte 5 | Smaller result |
| --- | ---: | ---: | --- |
| 1 route, 8 component definitions | 22.463 kB | 15.954 kB | Svelte by 6.509 kB |
| 64 routes, 512 component definitions | 114.570 kB | 121.849 kB | Vue by 7.279 kB |

![Svelte produces the smaller route-split application simulation at eight component definitions, while Vue produces the smaller simulation at 512 component definitions](docs/images/small-large-complete-bundles.svg)

*Each panel uses its own y-axis. These are two measured builds, not a claim that
every application crosses at the same point. The opening chart shows the
intermediate builds and estimated crossover.*

<details>
<summary>How the historical TodoMVC measurement explains the mechanism</summary>

Evan You’s original analysis isolated the component-specific code from the
shared framework runtime. Recompiling the same TodoMVC specimen with the pinned
2026 toolchain reproduces that mechanism:

| TodoMVC component output, runtime excluded | Vue 3.5 | Svelte 5 |
| --- | ---: | ---: |
| Minified | 3.802 kB | 5.213 kB |
| gzip | 1.484 kB | 1.762 kB |
| Brotli | 1.306 kB | 1.500 kB |

Vue generates less code for this component, but its larger runtime means that
Svelte still produces the smaller complete one-component application: 14.407
kB rather than 23.445 kB after Brotli compression. The component-only
measurement explains why Vue’s total grows more slowly; it is not itself a
complete application bundle.

Exact build details are in
[`original-specimen.md`](original-specimen.md).

</details>

## Run the benchmarks

Requirements:

- Node.js 22.19.0 (also recorded in `.nvmrc`)
- npm
- network access for the two commit-pinned upstream specimen lanes
- Chromium only if running the optional behavior-parity test

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
```

Generate the committed charts:

```bash
npm run charts
```

Run the small product-shaped application’s behavior contract:

```bash
npx playwright install chromium
npm test
```

Playwright opens both complete fixtures and performs the same interactions so
that unlike behavior cannot be rewarded with a smaller result. The browser and
test code are development-only dependencies and never enter a measured bundle.

## License

The benchmark harness and original fixtures in this repository are available
under the [MIT License](LICENSE). Fetched upstream specimens retain their
respective upstream licenses and are not committed here.
