# Source Ledger: Real-World Comparison Audit

## Scope Fence

Current lane: audit the Vue 3.5 and Svelte 5 bundle measurements in
`naufalafif/realworld-js-framework-comparison` and determine whether its
approximately 100 kB terminal result should influence the lead chart.

Allowed roots:

- `https://github.com/naufalafif/realworld-js-framework-comparison`
- `/tmp/realworld-js-framework-comparison-audit`
- `/Users/silouan/repos/vue-svelte-openslides-benchmark`

Forbidden roots:

- Unrelated framework-comparison repositories
- Other repositories under `/Users/silouan/repos`
- Parent-wide fallback searches

Out-of-scope fallback rule: if the pinned repository cannot be reproduced,
record the blocker and stop rather than substituting a different comparison.

| Source | Tier | Relevance |
| --- | --- | --- |
| [`naufalafif/realworld-js-framework-comparison`](https://github.com/naufalafif/realworld-js-framework-comparison/tree/2c338de860222deba6b842260cfbec6609c272bd) | Tier 1: primary source repository | Matched Vue 3.5/Svelte 5 applications and published gzip figures. |
| Local pinned checkout at `/tmp/realworld-js-framework-comparison-audit` | Tier 1: reproduced primary source | Build outputs, source audit, and independent measurements. |
| `apps/xterm/{vue,svelte}` at the pinned commit | Tier 1: primary source | Nearly line-for-line terminal implementations using identical xterm dependencies. |
| `bench/collectors/build-metrics.ts` at the pinned commit | Tier 1: primary source | Confirms that the published figure sums gzip sizes of emitted JavaScript files. |
| `e2e/tests/xterm.spec.ts` at the pinned commit | Tier 1: primary source | Shared but shallow UI/status assertions; it does not exercise terminal input/output. |
