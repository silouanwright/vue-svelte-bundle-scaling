# OpenSlides parity ledger

The OpenSlides benchmark is publishable only after the Vue port implements the same material product behavior as the pinned Svelte application. Component count and source-line count are recorded for context, but neither is accepted as proof of parity.

Status:

- **Shared E2E** — the same Playwright test passes against Vue and Svelte.
- **Implemented** — present in both sources, but not yet covered by the shared browser contract.
- **Missing** — the Vue port does not yet match the Svelte behavior.

| Capability | Status | Evidence or remaining work |
|---|---|---|
| Load the presentation dashboard | Shared E2E | `openslides-parity.spec.mjs` |
| Open a presentation from its card | Shared E2E | Same locator and route assertion |
| Create, rename, duplicate, delete, import, and export projects | Implemented | Rename, duplicate, and delete are shared E2E; import/export remain source-checked |
| Virtualize a large project grid | Implemented | Uses the matched TanStack Vue virtualizer; needs a large-data shared E2E case |
| Drag, stack, unstack, and spread project cards | Shared E2E | The shared contract proves stack rendering, spread, and ungroup; pointer drag remains source-checked |
| Load a deck and select its current slide | Shared E2E | Seeded deck opens at the persisted slide |
| Edit code and persist it through the Tauri command boundary | Shared E2E | The test verifies the debounced command and backend state |
| Find and replace code | Shared E2E | The same find, replace-all, and resulting code assertions pass |
| Editor undo and redo | Shared E2E | The contract undoes the replacement through controlled history |
| Add, duplicate, delete, and reorder slides | Implemented | Add, duplicate, and delete are shared E2E; drag reorder remains source-checked |
| Rename slides and edit timing | Shared E2E | The same context-menu rename and duration-slider contract persists through the mocked backend |
| Search and jump to slides | Shared E2E | The shared app event opens slide search; the contract filters and jumps to the matching slide |
| Slide hover preview | Implemented | Delayed fixed-position code preview; needs shared E2E coverage |
| Multi-select slides and perform bulk actions | Shared E2E | Context-menu entry, two-card selection, and group action use the same contract |
| Stack and unstack slides | Shared E2E | The contract groups, expands, and ungroups a two-slide stack |
| Create, edit, remove, and navigate highlight steps | Implemented | Presentation navigation is shared E2E; CRUD needs coverage |
| Render highlight dimming and scale effects | Implemented | Needs visual or DOM-level assertions |
| Render Shiki syntax highlighting | Shared E2E | Both editors use the same worker-backed Shiki release and expose highlighted token spans behind the textarea |
| Animate code changes with Shiki Magic Move | Shared E2E | Both editors render the framework wrapper’s Magic Move container |
| Configure theme, typography, layout, highlights, and motion | Implemented | Drawer opening and persisted code alignment are shared E2E; the remaining control families are source-checked |
| Present manually through highlights and slides | Shared E2E | The contract proves highlight-to-next-slide navigation |
| Autoplay using per-slide timing | Implemented | Autoplay activation/pause is shared E2E; deterministic timing progression remains source-checked |
| Enter and leave browser/native fullscreen | Implemented | Browser fullscreen with native Tauri fallback; overlay entry/exit is shared E2E |
| Command palette | Shared E2E | Same keyboard shortcut and visible input assertion |
| Keyboard-shortcuts reference | Implemented | Needs shared E2E coverage |
| Native menu, backend metadata bootstrap, and quit-save handshake | Implemented | Type-check/build only; native Tauri execution remains outside this browser contract |

## Publication scope

There are no **Missing** capabilities in the ledger. The shared contract covers
the core state-changing paths used for this benchmark; rows marked
**Implemented** remain explicitly outside the browser-tested scope. Native
Tauri execution is not claimed or required for the web-production bundle
measurement.
