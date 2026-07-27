# Changes from the pinned OpenSlides source

The Svelte fixture begins at OpenSlides commit
[`a8138eb26c93df378119147c036c34fe7d83b6a7`](https://github.com/codewiththiha/OpenSlides/tree/a8138eb26c93df378119147c036c34fe7d83b6a7).
The benchmark makes only these deliberate changes:

- Pins Svelte 5.56.8, Vite 8.1.5, the Svelte Vite plugin 7.2.0, Tailwind CSS
  4.3.3, and its matching Vite plugin.
- Emits a Vite manifest so the benchmark can identify the production entry
  graph.
- Disables Svelte’s version disclosure to match Vue’s app-informed production
  profile.
- Rewrites two expression-bodied state setters as block-bodied setters to
  avoid Svelte 5’s `assignment_value_stale` warning without changing behavior.
- Represents the NUL separator in one string literal as the source escape
  `\0` instead of embedding literal NUL bytes in the file. Runtime behavior is
  unchanged.

The regenerated `bun.lock` records the pinned toolchain. No product capability
was removed to improve Svelte’s measured result.
