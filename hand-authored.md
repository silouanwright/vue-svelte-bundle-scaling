# Hand-Authored Application Results

Generated: 2026-07-27T11:46:30.899Z

- Vue: 3.5.40
- Svelte: 5.56.8
- Vite: 8.1.5
- Workload: eight feature routes, three independently authored leaf components per route
- Compression: gzip level 9 and Brotli quality 11, applied to every JavaScript response independently

## Complete cold traversal

| Routes | Component definitions | Vue Brotli | Svelte Brotli | Vue − Svelte |
| ---: | ---: | ---: | ---: | ---: |
| 1 | 5 | 23,560 B | 13,992 B | +9,568 B |
| 2 | 9 | 26,247 B | 17,110 B | +9,137 B |
| 4 | 17 | 28,853 B | 20,712 B | +8,141 B |
| 8 | 33 | 33,353 B | 25,749 B | +7,604 B |

## Full eight-route application

| Metric | Vue | Svelte | Vue − Svelte |
| --- | ---: | ---: | ---: |
| Complete raw | 92,694 B | 69,822 B | +22,872 B |
| Complete gzip | 37,269 B | 29,266 B | +8,003 B |
| Complete Brotli | 33,353 B | 25,749 B | +7,604 B |
| Initial gzip | 28,219 B | 19,050 B | +9,169 B |
| Initial Brotli | 25,568 B | 17,168 B | +8,400 B |

## Full-application lazy route responses

| Route | Vue Brotli | Svelte Brotli | Vue − Svelte |
| --- | ---: | ---: | ---: |
| Search | 1,180 B | 1,301 B | -121 B |
| Records | 1,192 B | 1,393 B | -201 B |
| Reader | 1,149 B | 1,186 B | -37 B |
| Editor | 954 B | 986 B | -32 B |
| Settings | 1,173 B | 1,254 B | -81 B |
| Notifications | 1,033 B | 1,198 B | -165 B |
| Library | 1,104 B | 1,263 B | -159 B |

## Compression diagnostic

| Metric | Vue | Svelte |
| --- | ---: | ---: |
| Per-response Brotli / raw | 36.0% | 36.9% |
| Coalesced Brotli / raw | 33.0% | 32.8% |
| Coalesced Brotli | 30,610 B | 22,928 B |

The complete total counts every emitted JavaScript response once, matching a cold traversal of every route.
The initial total includes only the entry and its static imports. Coalesced sizes remain available in the JSON
as a repetition diagnostic; they are not presented as network transfer.
All seven Vue lazy route responses are smaller after Brotli in this build, but Svelte's smaller initial entry
keeps the complete 33-definition application smaller overall. Chunk allocation remains bundler-dependent.
Unlike the clone-heavy 640-Todo workload, this application does not compress to a single-digit percentage
of raw JavaScript. The coalesced row quantifies the dictionary sharing lost across route responses.

This workload is hand-authored and structurally varied, but it remains one small application with no third-party
product dependencies. It does not establish a universal component-count crossover.
