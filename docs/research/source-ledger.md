# Source Ledger

| Source | Location | Tier | Relevance |
| --- | --- | --- | --- |
| Evan You, `vue-svelte-size-analysis` | https://github.com/yyx990803/vue-svelte-size-analysis | 1 | Original 2021 methodology, specimens, measurements, and crossover argument |
| Vue size FAQ | https://vuejs.org/about/faq#is-vue-lightweight | 1 | Vue's current statement of the runtime-amortization argument |
| Rich Harris, “Frameworks without the framework” | https://svelte.dev/blog/frameworks-without-the-framework | 1 | Svelte creator's original statement of the no-upfront-runtime compiler argument |
| Svelte 5 announcement | https://svelte.dev/blog/svelte-5-is-alive | 1 | Primary account of Svelte 5's shared signals runtime and scaling motivations |
| Svelte 5 migration guide | https://svelte.dev/docs/svelte/v5-migration-guide | 1 | Official confirmation that Svelte 5 determines reactivity at runtime rather than exclusively at compile time |
| Vercel, “What is Svelte?” | https://vercel.com/i/what-is-svelte | 1 | Current framing from Svelte's corporate backer that the framework largely disappears and produces a smaller payload |
| Josh Collinsworth, “Introducing Svelte, and Comparing Svelte with React and Vue” | https://joshcollinsworth.com/blog/introducing-svelte-comparing-with-react-vue | 2 | Prominent advocate's explicit claim that Svelte's size crossover is unrealistically high for almost any application |
| Vite | https://github.com/vitejs/vite | 1 | Production build pipeline used by every current benchmark lane |
| Vue | https://github.com/vuejs/core | 1 | Framework and compiler under test |
| Svelte | https://github.com/sveltejs/svelte | 1 | Framework and compiler under test |
| `js-framework-benchmark` | https://github.com/krausest/js-framework-benchmark | 1 | Independently maintained matched Vue and Svelte application specimen |
| Brotli specification | https://www.rfc-editor.org/rfc/rfc7932 | 1 | Compression format used for reported network-size measurements |
| Node.js zlib API | https://nodejs.org/api/zlib.html | 1 | Implementation and parameters used for gzip and Brotli measurement |
| GitHub diagram documentation | https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/creating-diagrams | 1 | Native Mermaid rendering used for the README methodology map |

## Source Policy

- Upstream source specimens are fetched only at recorded commit hashes, and generated JSON records each fetched file's SHA-256 digest.
- Framework and build dependencies are pinned exactly in `package-lock.json`.
- Generated reports record tool versions and compression parameters.
- Community commentary may motivate a question but does not establish a benchmark conclusion.
- Sources were last reviewed on 2026-07-27.
