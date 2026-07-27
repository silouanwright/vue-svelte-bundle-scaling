# Route-Split Application Simulation Results

Generated: 2026-07-27T15:38:15.121Z

- Vue: 3.5.40
- Svelte: 5.56.8
- Vite: 8.1.5
- Framework profile: default
- Component families: 8
- Components per lazy route: 8
- Chunked sizes sum gzip/Brotli for each emitted JavaScript file
  independently, matching how route chunks are transferred.

## Independently compressed route chunks

| Components | Routes | Vue Brotli | Svelte Brotli | Vue − Svelte |
| ---: | ---: | ---: | ---: | ---: |
| 0 | 0 | 21,837 B | 11,347 B | +10,490 B |
| 8 | 1 | 24,932 B | 15,964 B | +8,968 B |
| 16 | 2 | 26,393 B | 17,788 B | +8,605 B |
| 32 | 4 | 29,314 B | 21,178 B | +8,136 B |
| 64 | 8 | 35,212 B | 27,801 B | +7,411 B |
| 128 | 16 | 46,882 B | 41,234 B | +5,648 B |
| 256 | 32 | 70,154 B | 68,050 B | +2,104 B |
| 512 | 64 | 117,254 B | 121,752 B | -4,498 B |

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
| raw | ≈ 499.3 | ≈ 499.3 |
| gzip | ≈ 237.1 | none sampled |
| brotli | ≈ 337.6 | none sampled |

At 512 components, independently compressed Brotli output was
117,254 B for Vue and 121,752 B for Svelte.
The same emitted files compressed as one artificial stream were 29,059 B
for Vue and 19,582 B for Svelte.

This benchmark reduces structural repetition and prevents Brotli from sharing
a dictionary across lazy route boundaries. It remains generated code, not a
substitute for porting a representative production slice.
