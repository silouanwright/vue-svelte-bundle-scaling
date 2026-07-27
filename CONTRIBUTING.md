# Contributing

Corrections, additional matched workloads, and methodology critiques are
welcome. A change should make the comparison more reproducible or more
representative without silently changing the question being measured.

Before opening a pull request:

```bash
npm ci
npx playwright install chromium
npm test
npm run benchmark:all
npm run verify
npm run charts
```

When changing a fixture:

- update the framework-neutral specification first;
- make equivalent Vue and Svelte changes;
- add or update parity assertions;
- regenerate every affected result;
- explain whether the change alters behavior, chunk boundaries, or only
  implementation syntax.

When adding a benchmark lane:

- pin external sources to immutable commits;
- record licenses and all source transformations;
- report raw, gzip, and Brotli sizes;
- compress separate JavaScript responses independently;
- commit machine-readable results and a readable report under `results/`;
- state what the workload cannot represent.

Do not submit a new universal crossover claim from one synthetic workload.
Results should distinguish observations, interpolation, and inference.
