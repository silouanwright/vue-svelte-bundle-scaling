# Independent Weather-App Comparison

## Source

- Repository:
  [`lissy93/framework-benchmarks`](https://github.com/lissy93/framework-benchmarks)
- Audited commit:
  [`53862d6eac22af7aca571ca11af25559059e2f14`](https://github.com/lissy93/framework-benchmarks/tree/53862d6eac22af7aca571ca11af25559059e2f14)
- Author: [Alicia Sykes](https://aliciasykes.com)
- License: MIT
- Vue implementation:
  [`apps/vue`](https://github.com/lissy93/framework-benchmarks/tree/53862d6eac22af7aca571ca11af25559059e2f14/apps/vue)
- Svelte implementation:
  [`apps/svelte`](https://github.com/lissy93/framework-benchmarks/tree/53862d6eac22af7aca571ca11af25559059e2f14/apps/svelte)
- Shared behavior suite:
  [`tests/weather-app.test.js`](https://github.com/lissy93/framework-benchmarks/blob/53862d6eac22af7aca571ca11af25559059e2f14/tests/weather-app.test.js)
- Bundle analyzer:
  [`scripts/benchmark/bundle_size.py`](https://github.com/lissy93/framework-benchmarks/blob/53862d6eac22af7aca571ca11af25559059e2f14/scripts/benchmark/bundle_size.py)

## Why it matters

This is not an application discovered after the fact. Sykes created the
project to implement the same weather application across frontend frameworks
and compare them through shared requirements, assets, tests, and automation.
That makes it useful independent evidence for the Vue/Svelte bundle-size
question.

The published report currently lists:

| Implementation | Raw framework-specific JS + CSS | gzip |
| --- | ---: | ---: |
| Vue | 76,585 B | 29,349 B |
| Svelte | 115,513 B | 38,344 B |

That is an emitted-file inventory, not the JavaScript and CSS transfer requested
by a browser. The inventory counts an unrequested duplicate Svelte CSS artifact
and excludes Vue’s separately served shared CSS files.

The commit-pinned reproduction in this repository instead loads each production
application in a cold browser and compresses every requested JavaScript and CSS
response independently:

| Requested production transfer | Vue | Svelte | Vue − Svelte |
| --- | ---: | ---: | ---: |
| Raw | 100,101 B | 99,194 B | +907 B |
| gzip | 35,281 B | 34,693 B | +588 B |
| Brotli | 31,423 B | 30,555 B | +868 B |

The browser-requested result narrowly favors Svelte. This makes Weather Front a
useful independent starting point, not evidence that the crossover has already
occurred.

## Application scale

Weather Front is best classified as a small application:

- one principal screen and one product workflow;
- eight Vue component definitions;
- roughly 754 lines of Vue application source and 896 lines of Svelte
  application source at the audited commit;
- asynchronous data, search, persistence, loading and error states;
- a 254-line shared Playwright behavior suite.

It is materially more representative than Hello World or an isolated widget,
but it does not have the breadth, navigation, permissions, or independently
evolving product areas expected of a medium-sized application.

## Normalization required before treating it as a 2026 benchmark

The upstream result should not be silently presented as an apples-to-apples
Vue 3 versus Svelte 5 measurement:

1. The audited Svelte source uses Svelte 4.2 and legacy stores, while the Vue
   source resolves to Vue 3.5.
2. Svelte uses SvelteKit and its client runtime, while Vue uses plain Vite.
3. The analyzer counts hashed shared CSS emitted by the Svelte build but
   excludes Vue’s separately served shared CSS filenames.
4. The Svelte implementation includes additional geolocation, race-control,
   store, and server-environment logic.
5. The published summary measures emitted inventory rather than resources
   requested by the application.

The responsible use is therefore twofold:

- cite the independent application as the small real-app baseline and describe
  both measurement boundaries;
- import both implementations into a current, matched Vue 3/Svelte 5 lane
  before making a normalized 2026 claim from them.

## Reproduction

From this repository:

```bash
npm run benchmark:weather-upstream
```

The command fetches the pinned upstream commit, builds both applications, loads
each production app with Chromium, and writes `weather-upstream.json` and
`weather-upstream.md`.

## Attribution

The application source, shared assets, and screenshot are copyright Alicia
Sykes and available under the upstream MIT License. Any substantial copied or
adapted source must retain the upstream copyright and license notice.
