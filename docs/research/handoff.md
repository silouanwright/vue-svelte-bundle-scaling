# Research Handoff: Vue–Svelte Bundle Scaling

The standalone repository contains five benchmark lanes:

1. current compilation of the exact 2021 TodoMVC source;
2. controlled 0–640-definition CSR, hydration, and SSR scaling;
3. generated heterogeneous lazy routes;
4. a commit-pinned independently maintained matched application;
5. a framework-neutral, hand-authored eight-route application.

Both hand-authored implementations pass the same browser behavior contract.
Two consecutive complete benchmark runs matched the normalized result lock.
Publication-facing claims and limitations are in `README.md`,
`METHODOLOGY.md`, and `analysis.md`.

The result should be used to rebut universal bundle-size slogans, not replace
them with a universal Vue crossover. Vue's amortization is measurable and can
survive per-route gzip/Brotli. Svelte remains smaller in both complete small
applications tested.
