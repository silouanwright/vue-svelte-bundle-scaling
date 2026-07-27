# Weather Workspace Specification

## Provenance

This fixture begins with the product surface of Alicia Sykes’s MIT-licensed
[Weather Front](https://github.com/lissy93/framework-benchmarks) application.
The implementation in this repository is newly authored for a normalized Vue
3/Svelte 5 comparison and retains attribution to the upstream design and
behavior contract.

## Core stage

Both implementations must provide:

- location search with matching suggestions;
- a loading state while a location is selected;
- a current-weather summary;
- a seven-day forecast;
- Celsius/Fahrenheit switching;
- identical data, model functions, labels, and shared CSS.

## Equivalence rules

- Vue and Svelte use the same plain Vite client-application boundary.
- Non-framework data and model code are byte-identical.
- Component boundaries are matched by responsibility.
- Vue uses Composition API only.
- Svelte uses Svelte 5 runes and current event syntax.
- Every published stage must pass the same Playwright behavior assertions.

## Transfer measurement

The complete transfer counts each emitted JavaScript and CSS response once.
Each response is compressed independently with gzip level 9 and Brotli quality
11. HTML, images, and shared remote resources are excluded.
