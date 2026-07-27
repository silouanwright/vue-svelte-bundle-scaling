# OpenSlides application benchmark

This fixture uses [OpenSlides](https://github.com/codewiththiha/OpenSlides) as a
real, medium-sized application specimen for comparing Vue and Svelte production
bundles.

The original Svelte application is pinned to
[`a8138eb26c93df378119147c036c34fe7d83b6a7`](https://github.com/codewiththiha/OpenSlides/tree/a8138eb26c93df378119147c036c34fe7d83b6a7).
It is preserved under [`svelte/`](./svelte/) with its original MIT license.
The small toolchain and source normalizations required by the 2026 benchmark
are listed in [`UPSTREAM_CHANGES.md`](./UPSTREAM_CHANGES.md).

The [`vue/`](./vue/) application is a behavior- and design-matched Vue 3 port.
It preserves the same application features, assets, styles, route boundaries,
Tauri command contract, and framework-neutral logic wherever practical.
Differences that cannot be normalized are documented rather than hidden.

The shared Playwright contract in
[`../../tests/openslides-parity.spec.mjs`](../../tests/openslides-parity.spec.mjs)
runs the same dashboard, editor, persistence, grouping, search, settings,
presentation, and autoplay workflows against both implementations. The precise
scope and remaining source-checked behaviors are recorded in
[`PARITY.md`](./PARITY.md).

This benchmark is not intended to declare a universal bundle-size crossover.
It tests the Vue amortization argument against one inspectable, reproducible
application rather than extrapolating a component specimen.
