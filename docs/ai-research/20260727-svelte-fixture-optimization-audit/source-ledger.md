# Source Ledger: Svelte Fixture Optimization Audit

## Scope Fence

Current lane: audit the Vue and Svelte benchmark fixtures for current,
idiomatic, production-relevant framework usage and optimization parity.

Allowed roots:

- `/Users/silouan/repos/vue-svelte-bundle-scaling`
- Official Svelte, Vue, and Vite documentation and source repositories
- Commit-pinned upstream benchmark sources already named by this repository

Forbidden roots:

- `/Users/silouan/repos/synaxis`
- The separate Vue-selection article and its research packet
- Unrelated framework benchmarks or local repositories unless explicitly added

Out-of-scope fallback rule: if the expected evidence is not available within
the allowed roots, record the gap. Do not broaden to unrelated repositories or
community anecdotes without first establishing the official-source baseline.

## Sources

| Source | Tier | Relevance | Status |
| --- | --- | --- | --- |
| Local benchmark fixtures and generators | 1 | Exact source being audited | In progress |
| [Svelte best practices](https://svelte.dev/docs/svelte/best-practices) | 1 | Current runes, events, each-block, class, and state guidance | Reviewed |
| [Svelte 5 migration guide](https://svelte.dev/docs/svelte/v5-migration-guide) | 1 | Defines current syntax and deprecated compiler options | Reviewed |
| [Svelte compiler options](https://github.com/sveltejs/svelte/blob/svelte%405.56.8/packages/svelte/src/compiler/validate-options.js) | 1 | Confirms production defaults including `discloseVersion` | Reviewed locally |
| [Vue compile-time flags](https://vuejs.org/api/compile-time-flags.html) | 1 | Documents tree-shakable Options API support | Reviewed |
| [Vue API styles](https://vuejs.org/guide/introduction.html#which-to-choose) | 1 | Confirms both APIs remain supported and recommends Composition API plus SFCs for full applications | Reviewed |
| [Vue performance guide](https://vuejs.org/guide/best-practices/performance) | 1 | Bundle and reactivity optimization controls | Reviewed |
| [Vite production build guide](https://vite.dev/guide/build) | 1 | Production build and code-splitting behavior | Reviewed |
