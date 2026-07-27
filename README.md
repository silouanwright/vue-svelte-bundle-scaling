# Vue–Svelte Size Analysis, Revisited for 2026

## TL;DR

- Svelte is the likely bundle-size winner for Hello World demos, isolated
  widgets, and small initial routes.
- Vue’s framework-and-component layer is likely to be smaller in medium-to-large
  applications, especially when users load many routes.

![Svelte uses fewer source lines in the matched fixture, while Vue eventually transfers less JavaScript](docs/images/route-split-brotli.svg)

*The chart plots each framework against its own source-line count, so its
estimated 1.6k-line intersection is not an equal-functionality threshold. The
matched-functionality Brotli benchmark crosses near 243 matched feature
definitions.*

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
followed this model. He concluded that Svelte provided a compelling advantage
for isolated components, but that its generated-code cost could become a
disadvantage for medium-to-large applications. This is also clearly documented
in the Vue FAQ:
[https://vuejs.org/about/faq#is-vue-lightweight](https://vuejs.org/about/faq#is-vue-lightweight).

The example application was TodoMVC—a tiny application. Even at that scale, the
benchmarks show that Vue is already generating less component-specific code
than Svelte.

## Is this still true in 2026?

Yes.

I put together this updated example to build on and expand Evan You’s original
comparison five years later, using a current toolchain and broader benchmarks.

## Updated packages for the 2026 benchmark

- Vue 3.5.40
- Svelte 5.56.8
- Vite 8.1.5
- `@vitejs/plugin-vue` 6.0.8
- `@sveltejs/vite-plugin-svelte` 7.2.0
- Node.js 22.19.0

The current Svelte implementation is idiomatic Svelte 5 and follows
[Svelte’s documented best
practices](https://svelte.dev/docs/svelte/best-practices).

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

## The same application, small and large

The clearest practical comparison is the same complete application fixture at
different sizes. With one route and eight matched features, Svelte is smaller.
After the fixture expands to 64 routes and 512 matched features, Vue is smaller.
Both measurements include the framework runtime and every route response a user
would load while traversing the application.

| Complete application transfer | Vue 3.5 | Svelte 5 | Smaller result |
| --- | ---: | ---: | --- |
| 1 route, 8 matched features | 22.463 kB | 15.954 kB | Svelte by 6.509 kB |
| 64 routes, 512 matched features | 114.570 kB | 121.849 kB | Vue by 7.279 kB |

![Svelte produces the smaller complete application at eight matched features, while Vue produces the smaller complete application at 512 matched features](docs/images/small-large-complete-bundles.svg)

*Each panel uses its own y-axis. These are two measured builds, not a claim that
every application crosses at the same point. The opening chart shows the
intermediate builds and estimated crossover.*

<details>
<summary>How the updated TodoMVC compiler comparison explains the crossover</summary>

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
