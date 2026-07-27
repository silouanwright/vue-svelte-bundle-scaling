# Findings

## Current Conclusions

- The original 2021 specimen still produces less isolated Vue component output with current compilers, although the compressed difference is much smaller.
- Complete small browser bundles remain substantially smaller with Svelte in the matched specimens tested so far.
- Vue's lower raw generated-code growth appears in complete multi-component builds and eventually repays its larger runtime baseline.
- Repeating one component shape hundreds of times gives Svelte's generated patterns an extreme compression advantage and cannot model a normal product.
- When eight component families are divided into independently compressed lazy routes, Vue's amortization becomes a gzip and Brotli transfer-size advantage in the sampled range.
- The route-split result is an existence proof, not a universal component-count threshold.
- Together, the route-split crossover and the smaller Vue lazy chunks in the hand-authored fixture support a practical inference: medium-to-large products with heterogeneous, independently transferred features are increasingly likely to amortize Vue's runtime and may be smaller than equivalent Svelte applications.
- Svelte's “framework disappears” language accurately emphasizes its lack of a large fixed runtime, but it does not establish a permanently smaller application. Svelte 5's own documentation describes runtime-determined reactivity.
- Vercel now makes the whole-application comparison explicitly, claiming Svelte produces smaller JavaScript bundles than Vue and that this causes faster page loads. The current benchmark refutes that as a universal claim, supplies a medium/large counterexample, and confirms it for the small specimens tested.
- Several third-party comparisons publish precise Vue-versus-Svelte ratios—10× smaller, 2× smaller, and 2.5× faster—but do not provide a current, reproducible, equivalent workload that supports generalizing those figures.
- A separate 2026 TodoMVC benchmark independently emphasizes baseline plus growth slope and shows Svelte 5's larger shared runtime and improved scaling relative to Svelte 4. Its multi-component curve is a linear simulation, so it corroborates the architectural model rather than replacing the complete-build and route-response measurements here.
- In that independent benchmark's gzip data, Svelte 5 has a 13,798 B runtime plus 1,946 B of selected TodoMVC output, while Vue 3 has a 24,699 B runtime plus 1,619 B of selected output. Its additive model therefore predicts a Vue crossover near 34 TodoMVC-sized components. This is useful corroboration of the slope, but it repeats the isolated-compressed-cost assumption that the current whole-build benchmark demonstrates is non-additive.

## Hand-Authored Lane

- The framework-neutral specification was fixed before measurement.
- Both complete implementations pass the same Playwright behavior contract.
- At 33 definitions, Svelte remained 7,604 B smaller for a complete Brotli cold traversal and 8,400 B smaller initially.
- The complete Brotli gap narrowed by 1,964 B from the 5-definition to the 33-definition build.
- All seven individual lazy route chunks were smaller in Vue after Brotli, but Vue's initial runtime baseline was not repaid in this application.

## Reproducibility

- Two consecutive complete five-lane runs produced the same normalized SHA-256 hashes.
- The verifier recomputes file totals and hashes all result-bearing fields except timestamp, reported Node version, and platform.
- Browser parity is deliberately separated from bundle construction and measurement.
