# Hand-Authored Application Results

Generated: 2026-07-27T15:37:01.333Z

- Vue: 3.5.40
- Svelte: 5.56.8
- Vite: 8.1.5
- Framework profile: default
- Workload: eight feature routes, three independently authored leaf components per route
- Compression: gzip level 9 and Brotli quality 11, applied to every JavaScript response independently

## Complete cold traversal

| Routes | Component definitions | Vue Brotli | Svelte Brotli | Vue − Svelte |
| ---: | ---: | ---: | ---: | ---: |
| 1 | 5 | 23,560 B | 13,992 B | +9,568 B |
| 2 | 9 | 26,247 B | 17,110 B | +9,137 B |
| 4 | 17 | 28,853 B | 20,865 B | +7,988 B |
| 8 | 33 | 33,280 B | 25,843 B | +7,437 B |

## Full eight-route application

| Metric | Vue | Svelte | Vue − Svelte |
| --- | ---: | ---: | ---: |
| Complete raw | 92,658 B | 70,202 B | +22,456 B |
| Complete gzip | 37,223 B | 29,436 B | +7,787 B |
| Complete Brotli | 33,280 B | 25,843 B | +7,437 B |
| Initial gzip | 28,219 B | 19,201 B | +9,018 B |
| Initial Brotli | 25,565 B | 17,281 B | +8,284 B |

## Full-application lazy route responses

| Route | Vue Brotli | Svelte Brotli | Vue − Svelte |
| --- | ---: | ---: | ---: |
| Search | 1,181 B | 1,311 B | -130 B |
| Records | 1,173 B | 1,386 B | -213 B |
| Reader | 1,144 B | 1,183 B | -39 B |
| Editor | 929 B | 976 B | -47 B |
| Settings | 1,159 B | 1,248 B | -89 B |
| Notifications | 1,028 B | 1,191 B | -163 B |
| Library | 1,101 B | 1,267 B | -166 B |

## Compression diagnostic

| Metric | Vue | Svelte |
| --- | ---: | ---: |
| Per-response Brotli / raw | 35.9% | 36.8% |
| Coalesced Brotli / raw | 32.9% | 32.8% |
| Coalesced Brotli | 30,527 B | 23,031 B |

The complete total counts every emitted JavaScript response once, matching a cold traversal of every route.
The initial total includes only the entry and its static imports. Coalesced sizes remain available in the JSON
as a repetition diagnostic; they are not presented as network transfer.
All seven Vue lazy route responses are smaller after Brotli in this build, but Svelte's smaller initial entry
keeps the complete 33-definition application smaller overall. Chunk allocation remains bundler-dependent.
Unlike the clone-heavy 640-Todo workload, this application does not compress to a single-digit percentage
of raw JavaScript. The coalesced row quantifies the dictionary sharing lost across route responses.

This workload is hand-authored and structurally varied, but it remains one small application with no third-party
product dependencies. It does not establish a universal component-count crossover.
