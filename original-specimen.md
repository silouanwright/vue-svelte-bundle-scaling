# Original 2021 TodoMVC Specimen with 2026 Tooling

Generated: 2026-07-27T11:46:25.730Z

- Original source commit: `7bb60ff681a3f5016e8af26084e72100cd37a876`
- Source-file SHA-256 digests: `original-specimen.json`
- Vue: 3.5.40
- Svelte: 5.56.8
- Vite: 8.1.5
- Production minifier: Oxc
- Required source migration: Vue `@vnode-mounted` → `@vue:mounted`
- Framework imports and the final library export are excluded from the
  component-only row because those bindings are shared in an application.

| Output | Vue | Svelte | Svelte / Vue |
| --- | ---: | ---: | ---: |
| Component only, raw | 3,802 B | 5,213 B | 1.37× |
| Component only, gzip | 1,484 B | 1,762 B | 1.19× |
| Component only, Brotli | 1,306 B | 1,500 B | 1.15× |

## Complete production bundles

| Lane and metric | Vue | Svelte | Vue − Svelte |
| --- | ---: | ---: | ---: |
| csr raw | 66,160 B | 41,203 B | +24,957 B |
| csr gzip | 25,764 B | 15,919 B | +9,845 B |
| csr Brotli | 23,445 B | 14,407 B | +9,038 B |
| hydrate raw | 70,606 B | 41,694 B | +28,912 B |
| hydrate gzip | 27,550 B | 16,116 B | +11,434 B |
| hydrate Brotli | 25,078 B | 14,587 B | +10,491 B |

This is a historical-specimen comparison, not a recommendation to write new
Svelte 5 code in legacy syntax. Apart from the required Vue hook rename
listed above, it holds the original sources constant while changing the
compiler and minifier.
