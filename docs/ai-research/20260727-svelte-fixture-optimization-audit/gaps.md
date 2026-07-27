# Gaps: Svelte Fixture Optimization Audit

- Would `$derived.by`, unkeyed iteration, immutable data, snippets, or different
  component boundaries reduce transferred JavaScript without changing the
  matched behavior?
- Determine whether `$state.raw` changes transfer size materially in the
  small replace-only notification cases. Official guidance emphasizes large
  objects, so this is not a canonical-source blocker.
- No official guidance found that recommends unkeying changing lists,
  replacing runes with legacy syntax, or changing behavior merely to reduce
  compiler output. Such variants would not be fair canonical optimizations.
