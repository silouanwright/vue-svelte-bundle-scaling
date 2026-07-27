# Route-Split Application Simulation Results — Trimmed Production Profile

Generated: 2026-07-27T15:44:02.416Z

- Vue: 3.5.40
- Svelte: 5.56.8
- Vite: 8.1.5
- Framework profile: trimmed
- Component families: 8
- Components per lazy route: 8
- Chunked sizes sum gzip/Brotli for each emitted JavaScript file
  independently, matching how route chunks are transferred.

## Independently compressed route chunks

| Components | Routes | Vue Brotli | Svelte Brotli | Vue − Svelte |
| ---: | ---: | ---: | ---: | ---: |
| 0 | 0 | 19,159 B | 11,312 B | +7,847 B |
| 8 | 1 | 22,463 B | 15,954 B | +6,509 B |
| 16 | 2 | 23,956 B | 17,767 B | +6,189 B |
| 32 | 4 | 26,911 B | 21,114 B | +5,797 B |
| 64 | 8 | 32,718 B | 27,808 B | +4,910 B |
| 128 | 16 | 44,400 B | 41,214 B | +3,186 B |
| 256 | 32 | 67,693 B | 68,055 B | -362 B |
| 512 | 64 | 114,570 B | 121,849 B | -7,279 B |

## Matched source scale

| Components | Vue nonblank lines | Svelte nonblank lines | Vue source | Svelte source |
| ---: | ---: | ---: | ---: | ---: |
| 0 | 23 | 20 | 592 B | 518 B |
| 8 | 165 | 135 | 5,231 B | 4,607 B |
| 16 | 307 | 250 | 9,911 B | 8,737 B |
| 32 | 591 | 480 | 19,289 B | 17,015 B |
| 64 | 1,159 | 940 | 38,045 B | 33,571 B |
| 128 | 2,295 | 1,860 | 75,745 B | 66,871 B |
| 256 | 4,567 | 3,700 | 151,569 B | 133,895 B |
| 512 | 9,111 | 7,380 | 303,217 B | 267,943 B |

## Crossover summary

| Metric | Independently compressed chunks | One coalesced bundle |
| --- | ---: | ---: |
| raw | ≈ 359.6 | ≈ 359.6 |
| gzip | ≈ 171.0 | none sampled |
| brotli | ≈ 242.9 | none sampled |

At 512 components, independently compressed Brotli output was
114,570 B for Vue and 121,849 B for Svelte.
The same emitted files compressed as one artificial stream were 26,504 B
for Vue and 19,564 B for Svelte.

This benchmark reduces structural repetition and prevents Brotli from sharing
a dictionary across lazy route boundaries. It remains generated code, not a
substitute for porting a representative production slice.
