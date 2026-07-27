# Heterogeneous Route-Split Bundle Results

Generated: 2026-07-27T14:31:32.674Z

- Vue: 3.5.40
- Svelte: 5.56.8
- Vite: 8.1.5
- Component families: 8
- Components per lazy route: 8
- Chunked sizes sum gzip/Brotli for each emitted JavaScript file
  independently, matching how route chunks are transferred.

## Independently compressed route chunks

| Components | Routes | Vue Brotli | Svelte Brotli | Vue − Svelte |
| ---: | ---: | ---: | ---: | ---: |
| 0 | 0 | 21,837 B | 11,347 B | +10,490 B |
| 8 | 1 | 24,945 B | 15,966 B | +8,979 B |
| 16 | 2 | 26,452 B | 17,788 B | +8,664 B |
| 32 | 4 | 29,367 B | 21,153 B | +8,214 B |
| 64 | 8 | 35,226 B | 27,858 B | +7,368 B |
| 128 | 16 | 46,947 B | 41,356 B | +5,591 B |
| 256 | 32 | 70,350 B | 68,158 B | +2,192 B |
| 512 | 64 | 117,145 B | 121,690 B | -4,545 B |

## Matched source scale

| Components | Vue nonblank lines | Svelte nonblank lines | Vue source | Svelte source |
| ---: | ---: | ---: | ---: | ---: |
| 0 | 23 | 20 | 592 B | 518 B |
| 8 | 165 | 135 | 5,217 B | 4,603 B |
| 16 | 307 | 250 | 9,883 B | 8,729 B |
| 32 | 591 | 480 | 19,233 B | 16,999 B |
| 64 | 1,159 | 940 | 37,933 B | 33,539 B |
| 128 | 2,295 | 1,860 | 75,521 B | 66,807 B |
| 256 | 4,567 | 3,700 | 151,121 B | 133,767 B |
| 512 | 9,111 | 7,380 | 302,321 B | 267,687 B |

## Crossover summary

| Metric | Independently compressed chunks | One coalesced bundle |
| --- | ---: | ---: |
| raw | ≈ 483.5 | ≈ 483.5 |
| gzip | ≈ 241.1 | none sampled |
| brotli | ≈ 339.3 | none sampled |

At 512 components, independently compressed Brotli output was
117,145 B for Vue and 121,690 B for Svelte.
The same emitted files compressed as one artificial stream were 28,964 B
for Vue and 19,622 B for Svelte.

This benchmark reduces structural repetition and prevents Brotli from sharing
a dictionary across lazy route boundaries. It remains generated code, not a
substitute for porting a representative production slice.
