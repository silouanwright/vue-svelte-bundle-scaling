# OpenSlides real-application benchmark

Generated: 2026-07-27T21:47:50.983Z

> Behaviorally matched for the documented benchmark scope; the shared Playwright contract passes against both production implementations

- Source: [OpenSlides](https://github.com/codewiththiha/OpenSlides)
- Pinned commit: `a8138eb26c93df378119147c036c34fe7d83b6a7`
- Measurement: Production JS/CSS/Wasm requested by a cold headless browser from dashboard through opening the seeded editor; Vite entry-manifest totals are also recorded
- Compression: Each emitted response compressed independently with gzip level 9 and Brotli quality 11
- Route splitting: Dashboard and editor are lazy-loaded route chunks in both implementations

- Shared behavior contract: [`tests/openslides-parity.spec.mjs`](../tests/openslides-parity.spec.mjs)
- Parity ledger: [`fixtures/openslides/PARITY.md`](../fixtures/openslides/PARITY.md)

| Entry JavaScript + CSS | Vue | Svelte | Vue − Svelte |
| --- | ---: | ---: | ---: |
| Raw | 276,469 B | 207,320 B | 69,149 B |
| gzip | 82,662 B | 56,033 B | 26,629 B |
| Brotli | 72,452 B | 49,255 B | 23,197 B |

| Cold production journey | Vue | Svelte | Vue − Svelte |
| --- | ---: | ---: | ---: |
| Dashboard gzip | 418,966 B | 541,648 B | −122,682 B |
| Dashboard Brotli | 309,676 B | 413,089 B | −103,413 B |
| Dashboard → editor gzip | 510,251 B | 889,338 B | −379,087 B |
| Dashboard → editor Brotli | 389,076 B | 656,812 B | −267,736 B |

The cold journey includes the Shiki worker, Wasm engine, selected languages,
and selected theme actually requested by each production build. Both
implementations request two Shiki asset sets after the editor opens.

| Source inventory | Vue | Svelte |
| --- | ---: | ---: |
| Components | 27 | 99 |
| Component lines | 3,866 | 8,639 |
| Total TS/JS/CSS/component lines | 8,771 | 18,762 |

The implementations are behavior-matched rather than source-shape-matched.
Vue uses fewer, larger component files; Svelte uses more, smaller component
and rune-module files. This case study therefore measures two credible
implementations of one product, not framework runtime bytes in isolation.

The complete-build totals include hundreds of optional Shiki language and
theme chunks. They are recorded in `openslides.json` for reproducibility
but are not treated as an application-transfer result.
