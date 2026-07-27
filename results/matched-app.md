# Matched Complete-Application Bundle

Generated: 2026-07-27T11:46:26.877Z

- Source: js-framework-benchmark keyed implementations at `6bd71fcab935b7e4c627b7c394a86633fcd8feea`
- Source-file URLs and SHA-256 digests: `matched-app.json`
- Vue: 3.5.40
- Svelte: 5.56.8
- Vite: 8.1.5
- Both sources implement the same benchmark behavior and are built here with
  the same Vite target, Oxc minifier, and compression settings.
- Svelte's Rollup-oriented HTML script tag is normalized to a Vite module
  entry; application source is unchanged.

| Total emitted JavaScript | Vue | Svelte | Vue − Svelte |
| --- | ---: | ---: | ---: |
| Raw | 63,652 B | 35,566 B | +28,086 B |
| gzip | 24,740 B | 13,957 B | +10,783 B |
| Brotli | 22,573 B | 12,654 B | +9,919 B |

This is more representative than multiplying one isolated component because
it measures complete production bundles and whole-bundle compression. It is
still one deliberately small benchmark application, not a proxy for every
large product architecture.
