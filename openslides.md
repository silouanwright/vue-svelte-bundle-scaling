# OpenSlides real-application benchmark

Generated: 2026-07-27T21:25:49.678Z

> Behaviorally matched for the documented benchmark scope; the shared Playwright contract passes against both production implementations

- Source: [OpenSlides](https://github.com/codewiththiha/OpenSlides)
- Pinned commit: `a8138eb26c93df378119147c036c34fe7d83b6a7`
- Measurement: Production JS/CSS/Wasm requested by a cold headless browser from dashboard through opening the seeded editor; Vite entry-manifest totals are also recorded
- Compression: Each emitted response compressed independently with gzip level 9 and Brotli quality 11

- Shared behavior contract: [`tests/openslides-parity.spec.mjs`](tests/openslides-parity.spec.mjs)
- Parity ledger: [`fixtures/openslides/PARITY.md`](fixtures/openslides/PARITY.md)

| Entry JavaScript + CSS | Vue | Svelte | Vue − Svelte |
| --- | ---: | ---: | ---: |
| Raw | 635,658 B | 1,030,039 B | −394,381 B |
| gzip | 192,863 B | 303,906 B | −111,043 B |
| Brotli | 163,396 B | 248,124 B | −84,728 B |

| Cold production journey | Vue | Svelte | Vue − Svelte |
| --- | ---: | ---: | ---: |
| Dashboard gzip | 456,999 B | 618,423 B | −161,424 B |
| Dashboard Brotli | 338,033 B | 465,447 B | −127,414 B |
| Dashboard → editor gzip | 754,968 B | 882,558 B | −127,590 B |
| Dashboard → editor Brotli | 543,247 B | 640,079 B | −96,832 B |

The cold journey includes the Shiki worker, Wasm engine, selected languages,
and selected theme actually requested by each production build. The two
implementations share the same worker source. OpenSlides’ current Svelte
architecture also requests a second main-thread Shiki asset set after the
editor opens; that is a real application cost, but it is not attributed
solely to the Svelte compiler.

| Source inventory | Vue | Svelte |
| --- | ---: | ---: |
| Components | 27 | 99 |
| Component lines | 3,866 | 8,639 |
| Total TS/JS/CSS/component lines | 8,773 | 18,759 |

The implementations are behavior-matched rather than source-shape-matched.
Vue uses fewer, larger component files; Svelte uses more, smaller component
and rune-module files. This case study therefore measures two credible
implementations of one product, not framework runtime bytes in isolation.

The complete-build totals include hundreds of optional Shiki language and
theme chunks. They are recorded in `openslides.json` for reproducibility
but are not treated as an application-transfer result.
