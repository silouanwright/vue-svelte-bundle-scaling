# Closed and Remaining Gaps

## Closed

- Framework-neutral hand-authored specification
- Equivalent Vue and Svelte applications
- Full-route behavior-parity test
- Initial, lazy-route, complete traversal, and coalesced measurements
- Normalized deterministic-result verifier
- CI and manual complete-reproduction workflow
- Publication README, methodology, analysis, provenance, and license

## Remaining by Design

- No generic benchmark can predict a particular production application's chunk graph.
- The hand-authored lane excludes third-party product dependencies so framework/application code remains visible.
- Rendering speed, memory, type tooling, ecosystem quality, and development cost are outside this repository's scope.
- Future framework or build-tool releases require a new pinned result set rather than an unversioned update.
