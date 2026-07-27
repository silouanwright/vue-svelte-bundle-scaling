# Research Handoff: Svelte Fixture Optimization Audit

## Goal

Determine whether current Svelte fixtures are idiomatic and fairly optimized,
measure any defensible alternatives, and prevent “you wrote Svelte badly” from
remaining an unsupported escape hatch.

## Current conclusion

The fixtures use the current Svelte 5 model and compile without warnings.
Current official class syntax was applied, an unmatched Vue watcher was
removed, and default plus symmetric trimmed production profiles were
measured. The trimmed profile moves the route-split Brotli crossover from
approximately 338 to 243 generated definitions.

## Important files

- `findings.md`
- `gaps.md`
- `source-ledger.md`
- `scripts/run-benchmark.mjs`
- `scripts/run-route-split.mjs`
- `scripts/run-hand-authored.mjs`
- `fixtures/hand-authored/svelte/`
- `fixtures/hand-authored/vue/`

## Next steps

1. Run parity, documentation, chart, and result-integrity checks.
2. Review the publication diff for stale measurements.
3. Commit and push the completed audit.

## Resume prompt

Read this handoff and the adjacent scope fence first. Continue only within the
benchmark repository and official framework sources.
