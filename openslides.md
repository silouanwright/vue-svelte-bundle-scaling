# OpenSlides real-application benchmark

Generated: 2026-07-27T20:34:44.699Z

> Behaviorally matched for the documented benchmark scope; the shared Playwright contract passes against both production implementations

- Source: [OpenSlides](https://github.com/codewiththiha/OpenSlides)
- Pinned commit: `a8138eb26c93df378119147c036c34fe7d83b6a7`
- Measurement: Production JS/CSS/Wasm requested by a cold headless browser from dashboard through opening the seeded editor; Vite entry-manifest totals are also recorded
- Compression: Each emitted response compressed independently with gzip level 9 and Brotli quality 11

- Shared behavior contract: [`tests/openslides-parity.spec.mjs`](tests/openslides-parity.spec.mjs)
- Parity ledger: [`fixtures/openslides/PARITY.md`](fixtures/openslides/PARITY.md)

| Entry JavaScript + CSS | Vue | Svelte | Vue − Svelte |
| --- | ---: | ---: | ---: |
| Raw | 631,276 B | 1,029,663 B | −398,387 B |
| gzip | 191,825 B | 303,784 B | −111,959 B |
| Brotli | 162,626 B | 248,026 B | −85,400 B |

| Cold production journey | Vue | Svelte | Vue − Svelte |
| --- | ---: | ---: | ---: |
| Dashboard gzip | 455,960 B | 618,301 B | −162,341 B |
| Dashboard Brotli | 337,268 B | 465,349 B | −128,081 B |
| Dashboard → editor gzip | 505,425 B | 882,438 B | −377,013 B |
| Dashboard → editor Brotli | 379,583 B | 639,979 B | −260,396 B |

The cold journey includes the Shiki worker, Wasm engine, selected languages,
and selected theme actually requested by each production build. The two
implementations share the same worker source. OpenSlides’ current Svelte
architecture also requests a second main-thread Shiki asset set after the
editor opens; that is a real application cost, but it is not attributed
solely to the Svelte compiler.

| Source inventory | Vue | Svelte |
| --- | ---: | ---: |
| Components | 27 | 99 |
| Component lines | 3,699 | 8,626 |
| Total TS/JS/CSS/component lines | 8,573 | 18,746 |

The implementations are behavior-matched rather than source-shape-matched.
Vue uses fewer, larger component files; Svelte uses more, smaller component
and rune-module files. This case study therefore measures two credible
implementations of one product, not framework runtime bytes in isolation.

The complete-build totals include hundreds of optional Shiki language and
theme chunks. They are recorded in `openslides.json` for reproducibility
but are not treated as an application-transfer result.
