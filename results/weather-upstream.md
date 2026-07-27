# Upstream Weather Front: Requested Production Assets

Generated: 2026-07-27T17:45:07.109Z

- Source: [Alicia Sykes’s framework benchmark](https://github.com/lissy93/framework-benchmarks)
- Pinned source commit: `53862d6eac22af7aca571ca11af25559059e2f14`
- Upstream license: MIT
- This preserves the upstream Vue/Vite and Svelte 4/SvelteKit application
  modes; it is not the normalized Vue 3/Svelte 5 comparison.
- Only JavaScript and CSS responses actually requested by a cold browser
  load are included. Unrequested build artifacts are excluded.

| Requested production assets | Vue | Svelte | Vue − Svelte |
| --- | ---: | ---: | ---: |
| Raw | 100,101 B | 99,194 B | +907 B |
| gzip | 35,281 B | 34,693 B | +588 B |
| Brotli | 31,423 B | 30,555 B | +868 B |

The complete upstream weather application remains slightly smaller in
Svelte when measured by requested transfer. It is therefore a useful
starting point for the staged application curve, not evidence that the
crossover has already occurred.
