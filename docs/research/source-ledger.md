# Source Ledger

| Source | Live or canonical location | Preserved evidence | Tier | Relevance |
| --- | --- | --- | --- | --- |
| Evan You, `vue-svelte-size-analysis` | [Repository](https://github.com/yyx990803/vue-svelte-size-analysis) | [Commit `7bb60ff`](https://github.com/yyx990803/vue-svelte-size-analysis/tree/7bb60ff681a3f5016e8af26084e72100cd37a876) | 1 | Original 2021 methodology, specimens, measurements, and crossover argument |
| Vue size FAQ | [Live](https://vuejs.org/about/faq#is-vue-lightweight) | [2026-07-27 snapshot](https://web.archive.org/web/20260727134318/https://vuejs.org/about/faq#is-vue-lightweight) | 1 | Vue's current statement of the runtime-amortization argument |
| Rich Harris, “Frameworks without the framework” | [Live](https://svelte.dev/blog/frameworks-without-the-framework) | [2026-07-27 snapshot](https://web.archive.org/web/20260727134238/https://svelte.dev/blog/frameworks-without-the-framework) | 1 | Svelte creator's original statement of the no-upfront-runtime compiler argument |
| Svelte 5 announcement | [Live](https://svelte.dev/blog/svelte-5-is-alive) | [2026-07-27 snapshot](https://web.archive.org/web/20260727134144/https://svelte.dev/blog/svelte-5-is-alive) | 1 | Primary account of Svelte 5's shared signals runtime and scaling motivations |
| Svelte 5 migration guide | [Live](https://svelte.dev/docs/svelte/v5-migration-guide) | [2026-07-27 snapshot](https://web.archive.org/web/20260727134921/https://svelte.dev/docs/svelte/v5-migration-guide) | 1 | Official confirmation that Svelte 5 determines reactivity at runtime rather than exclusively at compile time |
| Vercel, “What is Svelte?” | [Live](https://vercel.com/i/what-is-svelte) | [2026-07-27 snapshot](https://web.archive.org/web/20260727134258/https://vercel.com/i/what-is-svelte) | 1 | Current framing from Svelte's corporate backer that the framework largely disappears, produces a smaller JavaScript payload, and has a smaller runtime footprint than Vue |
| PkgPulse, “Vue 3 vs Svelte 5” | [Live](https://www.pkgpulse.com/guides/vue-3-vs-svelte-5-2026) | [2026-07-27 snapshot](https://web.archive.org/web/20260727134421/https://www.pkgpulse.com/guides/vue-3-vs-svelte-5-2026) | 3 | Current categorical claim that equivalent Svelte bundles are roughly 2× smaller than Vue and that the absolute gap remains in large applications, without a linked reproducible workload sufficient to audit the figures |
| ButterCMS, “Svelte vs Vue” | [Live](https://buttercms.com/blog/svelte-vs-vue-which-one-to-choose/) | [2026-07-27 snapshot](https://web.archive.org/web/20260727134449/https://buttercms.com/blog/svelte-vs-vue-which-one-to-choose/) | 3 | Updated article using a historical small specimen to characterize a 72 kB Vue bundle versus 7 kB Svelte bundle as a 10× “unquestionable victory” |
| `frontend-framework-bundle-size` | [Repository](https://github.com/mlgq/frontend-framework-bundle-size) | [Commit `c5d093c`](https://github.com/mlgq/frontend-framework-bundle-size/tree/c5d093c7966c05c0b719dcd59a30b7665e319e7b) | 2 | Current reproducible TodoMVC comparison that separately models runtime and marginal output; corroborates starting point plus slope but linearly simulates component growth |
| Jesper Høy, “Svelte vs. Vue.js” | [Live](https://dev.to/jesperhoy/svelte-vs-vue-js-2an5) | [2023-12-04 snapshot](https://web.archive.org/web/20231204194924/https://dev.to/jesperhoy/svelte-vs-vue-js-2an5) | 3 | Direct Vue-to-Svelte port reporting 32.8 kB gzip for Vue 2 and 19.2 kB for Svelte while acknowledging Svelte's steeper growth |
| Evan You, DEV comment on Svelte-like improvements | [Live](https://dev.to/yyx990803/comment/1h6c2) | [2026-07-27 snapshot](https://web.archive.org/web/20260727135023/https://dev.to/yyx990803/comment/1h6c2) | 1 | Direct claim that non-trivial Vue 3 applications can combine similar runtime performance with smaller bundles than Svelte |
| Vite 8.1.5 | [Release tag](https://github.com/vitejs/vite/releases/tag/v8.1.5) | [Commit `5e7fe12`](https://github.com/vitejs/vite/tree/5e7fe129a4dde4f41934083b25e490059985f4e6) | 1 | Production build pipeline used by every current benchmark lane |
| Vue 3.5.40 | [Release tag](https://github.com/vuejs/core/releases/tag/v3.5.40) | [Commit `fa2885d`](https://github.com/vuejs/core/tree/fa2885d8c48768d26f1666a01bd540ffe3b20f9b) | 1 | Framework and compiler under test |
| Svelte 5.56.8 | [Release tag](https://github.com/sveltejs/svelte/releases/tag/svelte%405.56.8) | [Commit `44a7813`](https://github.com/sveltejs/svelte/tree/44a7813730579b94004e182e5a67aab27aa9d2a6) | 1 | Framework and compiler under test |
| `js-framework-benchmark` | [Repository](https://github.com/krausest/js-framework-benchmark) | [Commit `6bd71fc`](https://github.com/krausest/js-framework-benchmark/tree/6bd71fcab935b7e4c627b7c394a86633fcd8feea) | 1 | Independently maintained matched Vue and Svelte application specimen |
| Brotli specification | [RFC 7932](https://www.rfc-editor.org/rfc/rfc7932) | Immutable RFC | 1 | Compression format used for reported network-size measurements |
| Node.js zlib API | [Documentation](https://nodejs.org/api/zlib.html) | Version recorded in generated results | 1 | Implementation and parameters used for gzip and Brotli measurement |
| GitHub diagram documentation | [Documentation](https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/creating-diagrams) | Not evidentiary | 1 | Native Mermaid rendering used for the README methodology map |

## Source Policy

- Upstream source specimens are fetched only at recorded commit hashes, and generated JSON records each fetched file's SHA-256 digest.
- Mutable claim pages are cited through dated Wayback snapshots in the publication README. The live URL remains in this ledger for reader convenience.
- GitHub methodology, source specimens, and independently maintained fixtures are pinned to exact commits rather than moving branch URLs.
- Framework and build dependencies are pinned exactly in `package-lock.json`.
- Generated reports record tool versions and compression parameters.
- Community commentary may motivate a question but does not establish a benchmark conclusion.
- Sources were last reviewed on 2026-07-27.
