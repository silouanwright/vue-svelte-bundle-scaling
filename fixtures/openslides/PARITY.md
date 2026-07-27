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
| Create, rename, duplicate, delete, import, and export projects | Shared E2E | The contract verifies each operation and its persisted backend result |
| Virtualize a large project grid | Shared E2E | A 120-project fixture proves windowed rendering and access to the final project |
| Drag, stack, unstack, and spread project cards | Shared E2E | A pointer drag creates a stack; the same contract expands, spreads, and ungroups it |
| Load a deck and select its current slide | Shared E2E | Seeded deck opens at the persisted slide |
| Edit code and persist it through the Tauri command boundary | Shared E2E | The test verifies the debounced command and backend state |
| Find and replace code | Shared E2E | The same find, replace-all, and resulting code assertions pass |
| Editor undo and redo | Shared E2E | The contract undoes the replacement through controlled history |
| Add, duplicate, delete, and reorder slides | Shared E2E | The contract persists an explicit reorder and verifies add, duplicate, and delete |
| Rename slides and edit timing | Shared E2E | The same context-menu rename and duration-slider contract persists through the mocked backend |
| Search and jump to slides | Shared E2E | The shared app event opens slide search; the contract filters and jumps to the matching slide |
| Slide hover preview | Shared E2E | The persisted preference enables the delayed preview and pointer exit removes it |
| Multi-select slides and perform bulk actions | Shared E2E | Context-menu entry, two-card selection, and group action use the same contract |
| Stack and unstack slides | Shared E2E | The contract groups, expands, and ungroups a two-slide stack |
| Create, edit, reorder, remove, and navigate highlight steps | Shared E2E | The contract creates a selected-code step, edits it, reorders it, deletes it, and navigates it |
| Render highlight dimming and scale effects | Shared E2E | Semantic effect hooks are asserted only after the corresponding persisted settings are active |
| Render Shiki syntax highlighting | Shared E2E | Both editors use the same worker-backed Shiki release and expose highlighted token spans behind the textarea |
| Animate code changes with Shiki Magic Move | Shared E2E | Both editors render the framework wrapper’s Magic Move container |
| Configure theme, typography, layout, highlights, and motion | Shared E2E | Theme, alignment, line numbers, editor preferences, global highlight, and global transition settings persist through one contract |
| Present manually through highlights and slides | Shared E2E | The contract proves highlight-to-next-slide navigation |
| Autoplay using per-slide timing | Shared E2E | A short-duration fixture deterministically advances from the first slide to the second |
| Enter and leave browser/native fullscreen | Shared E2E | The contract accepts browser fullscreen or the native Tauri fallback and exits the overlay |
| Command palette | Shared E2E | Same keyboard shortcut and visible input assertion |
| Keyboard-shortcuts reference | Shared E2E | Both the keyboard shortcut and native-menu event open the same reference dialog |
| Native menu, backend metadata bootstrap, and quit-save handshake | Shared E2E | Mocked Tauri menu events exercise dashboard/editor actions; `app://quit-request` reaches `finish_quit` after the save flush |

## Publication scope

There are no **Missing** or source-only product claims in the ledger. The
shared Playwright contract now runs nine behavior workflows against each
framework—18 passing cases total. Native operating-system chrome and the Rust
process are not part of a web-production bundle measurement; the frontend
event, metadata, fullscreen-fallback, and quit-save boundaries are exercised
through the same Tauri-compatible browser backend.
