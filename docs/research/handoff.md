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

The README's “Why this benchmark exists” section now uses distributed linked
paraphrases to establish the public claim under test. It moves from Rich
Harris's original no-runtime pitch through Svelte 5 and Vercel's current
payload framing, then documents the 2× and 10× claims made in third-party
comparisons. Those ratios are evidence of public framing, not accepted
benchmark inputs.

The README distinguishes cold initial transfer, incremental navigation, and
complete cold traversal. Vue only amortizes over features a user actually
loads. Browser reuse can preserve chunks within a running application and
across visits when caching is configured, but it benefits both frameworks and
does not erase cold-start measurements.

Mutable claim sources are preserved in dated Wayback snapshots using the
Follow the Saints `wayback` workflow. GitHub evidence is pinned to exact
commits. Both live and preserved locations are recorded in
`docs/research/source-ledger.md`.

The result should be used to rebut universal bundle-size slogans, not replace
them with a universal Vue crossover. Vue's amortization is measurable and can
survive per-route gzip/Brotli. Svelte remains smaller in both complete small
applications tested.
