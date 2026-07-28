# OpenSlides real-application benchmark

Generated: 2026-07-28T02:00:07.033Z

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
| Raw | 276,469 B | 207,462 B | 69,007 B |
| gzip | 82,662 B | 56,077 B | 26,585 B |
| Brotli | 72,452 B | 49,294 B | 23,158 B |

| Cold production journey | Vue | Svelte | Vue − Svelte |
| --- | ---: | ---: | ---: |
| Dashboard gzip | 418,966 B | 491,373 B | −72,407 B |
| Dashboard Brotli | 309,676 B | 370,531 B | −60,855 B |
| Dashboard → editor gzip | 510,251 B | 574,877 B | −64,626 B |
| Dashboard → editor Brotli | 389,076 B | 439,572 B | −50,496 B |

The cold journey includes the Shiki worker, Wasm engine, selected languages,
and selected theme actually requested by each production build. Both
canonical applications transfer one engine, language, and theme set during
the measured journey. Vue also requests its editor worker script.

| Source inventory | Vue | Svelte |
| --- | ---: | ---: |
| Components | 27 | 99 |
| Component lines | 3,866 | 8,629 |
| Total TS/JS/CSS/component lines | 8,771 | 18,772 |

The implementations are behavior-matched rather than source-shape-matched.
Vue uses fewer, larger component files; Svelte uses more, smaller component
and rune-module files. This case study therefore measures two credible
implementations of one product, not framework runtime bytes in isolation.

The complete-build totals include hundreds of optional Shiki language and
theme chunks. They are recorded in `openslides.json` for reproducibility
but are not treated as an application-transfer result.
