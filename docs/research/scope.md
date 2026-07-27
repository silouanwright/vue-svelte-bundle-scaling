# Research Scope

## Question

How do current Vue and Svelte production bundles scale when an application adds component definitions, realistic feature diversity, and independently transferred lazy-route chunks?

## Expected Output

A reproducible, publication-ready 2026 reproduction and extension of Evan You's 2021 Vue–Svelte size analysis.

## Sub-questions

1. What do current compilers emit for the original TodoMVC specimen?
2. Does Vue's lower generated-code growth appear in complete multi-component builds?
3. How do gzip and Brotli change the result when components share one compression stream?
4. How do independently compressed route chunks change the result?
5. What happens in a hand-authored application whose features are structurally different?
6. Which conclusions survive repeated deterministic runs?

## Scope Fence

Current lane: Vue 3.5 and Svelte 5 bundle-size reproduction and extension.

Allowed inputs:

- files committed to this repository;
- the exact commit-pinned upstream files named by the benchmark scripts;
- primary framework and build-tool documentation used to interpret results.
- public framework and advocacy claims used only to establish the premise being
  tested, not as benchmark evidence.

Excluded inputs:

- unpinned framework examples or benchmark implementations;
- unpublished application code used as a substitute specimen;
- community or marketing claims used as evidence for a benchmark conclusion.

Out-of-scope fallback rule:

If a required source is absent from the repository or pinned upstream
locations, record the gap. Do not broaden into unrelated projects as substitute
benchmark material.

## Stopping Criteria

- All benchmark lanes run successfully from a clean dependency installation.
- The complete matrix is repeated and normalized outputs match.
- The hand-authored Vue and Svelte applications pass the same behavioral parity suite.
- Reports distinguish raw, gzip, Brotli, initial-route, per-route, and complete cold-traversal sizes.
- Claims state what each experiment proves and does not prove.
- CI, licensing, source provenance, and reproduction instructions are present.
