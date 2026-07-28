# Independent Terminal Application

Generated: 2026-07-28T01:36:21.629Z

- Source: [realworld-js-framework-comparison](https://github.com/naufalafif/realworld-js-framework-comparison/tree/2c338de860222deba6b842260cfbec6609c272bd)
- Pinned source commit: `2c338de860222deba6b842260cfbec6609c272bd`
- Upstream license: MIT
- Both independently authored implementations use plain Vite production builds.
- The Vue build uses Composition API only, with its unused Options API and
  production diagnostics disabled.
- JavaScript and CSS are included; each emitted response is compressed
  independently.

| Complete production assets | Vue | Svelte | Vue − Svelte |
| --- | ---: | ---: | ---: |
| Raw | 374,776 B | 352,924 B | 21,852 B |
| Gzip | 102,565 B | 93,238 B | 9,327 B |
| Brotli | 86,265 B | 77,671 B | 8,594 B |

Svelte is smaller in this complete small application.
