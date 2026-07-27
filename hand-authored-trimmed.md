# Hand-Authored Application Results — Trimmed Production Profile

Generated: 2026-07-27T15:44:05.110Z

- Vue: 3.5.40
- Svelte: 5.56.8
- Vite: 8.1.5
- Framework profile: trimmed
- Workload: eight feature routes, three independently authored leaf components per route
- Compression: gzip level 9 and Brotli quality 11, applied to every JavaScript response independently

## Complete cold traversal

| Routes | Component definitions | Vue Brotli | Svelte Brotli | Vue − Svelte |
| ---: | ---: | ---: | ---: | ---: |
| 1 | 5 | 21,064 B | 13,994 B | +7,070 B |
| 2 | 9 | 24,596 B | 17,046 B | +7,550 B |
| 4 | 17 | 27,150 B | 20,868 B | +6,282 B |
| 8 | 33 | 31,681 B | 25,820 B | +5,861 B |

## Full eight-route application

| Metric | Vue | Svelte | Vue − Svelte |
| --- | ---: | ---: | ---: |
| Complete raw | 87,683 B | 70,137 B | +17,546 B |
| Complete gzip | 35,370 B | 29,391 B | +5,979 B |
| Complete Brotli | 31,681 B | 25,820 B | +5,861 B |
| Initial gzip | 26,371 B | 19,168 B | +7,203 B |
| Initial Brotli | 23,968 B | 17,276 B | +6,692 B |

## Full-application lazy route responses

| Route | Vue Brotli | Svelte Brotli | Vue − Svelte |
| --- | ---: | ---: | ---: |
| Search | 1,181 B | 1,299 B | -118 B |
| Records | 1,171 B | 1,388 B | -217 B |
| Reader | 1,148 B | 1,182 B | -34 B |
| Editor | 932 B | 974 B | -42 B |
| Settings | 1,158 B | 1,247 B | -89 B |
| Notifications | 1,025 B | 1,191 B | -166 B |
| Library | 1,098 B | 1,263 B | -165 B |

## Compression diagnostic

| Metric | Vue | Svelte |
| --- | ---: | ---: |
| Per-response Brotli / raw | 36.1% | 36.8% |
| Coalesced Brotli / raw | 32.9% | 32.8% |
| Coalesced Brotli | 28,880 B | 22,979 B |

The complete total counts every emitted JavaScript response once, matching a cold traversal of every route.
The initial total includes only the entry and its static imports. Coalesced sizes remain available in the JSON
as a repetition diagnostic; they are not presented as network transfer.
All seven Vue lazy route responses are smaller after Brotli in this build, but Svelte's smaller initial entry
keeps the complete 33-definition application smaller overall. Chunk allocation remains bundler-dependent.
Unlike the clone-heavy 640-Todo workload, this application does not compress to a single-digit percentage
of raw JavaScript. The coalesced row quantifies the dictionary sharing lost across route responses.

This workload is hand-authored and structurally varied, but it remains one small application with no third-party
product dependencies. It does not establish a universal component-count crossover.
