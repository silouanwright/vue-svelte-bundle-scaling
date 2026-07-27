# Findings: Svelte Fixture Optimization Audit

## Research question

Could a knowledgeable Svelte 5 developer materially reduce the measured
Svelte output by rewriting or configuring the fixtures according to current
official guidance, and would an equivalent Vue optimization be available?

## Source audit

- The generated and hand-authored Svelte fixtures already use Svelte 5 runes:
  `$state`, `$derived`, `$props`, and `$bindable`.
- Keyed `{#each}` blocks are used wherever the matched Vue fixture uses keyed
  `v-for`.
- The benchmark uses production Vite builds, current official framework
  plugins, Oxc minification, and identical gzip/Brotli accounting.
- All 33 hand-authored `.svelte` files compile with zero Svelte compiler
  warnings.

## Official-guidance audit

- **Runes:** fixtures use `$state`, `$derived`, `$props`, and `$bindable`; no
  legacy reactive declarations, `export let`, event directives, slots, or
  `<svelte:component>` remain.
- **Derivations:** computed state uses `$derived`; no fixture misuses `$effect`.
- **Events:** current event attributes such as `onclick` and `onsubmit` are
  used.
- **Lists:** changing collections use keyed `{#each}` blocks. The one unkeyed
  generated route menu is a constant list that never changes.
- **Dynamic components:** `<CurrentRoute />` is the documented Svelte 5 form.
- **Deep state:** deeply mutable arrays correctly use `$state`. `$state.raw`
  is only a plausible sensitivity variant for small collections that are
  replaced wholesale; official guidance primarily recommends it for large
  objects, so it is not automatically a better canonical source.
- **Compiler options:** `immutable` is ignored in runes mode. Explicit
  `runes: true` would not change components that already contain runes.
- **Modern class syntax:** four hand-authored components and two generated
  component shapes used `class:` directives. They were converted to the
  current object-valued `class` recommendation and remeasured.

## Fairness defects and sensitivity profiles

- `AutosaveStatus.vue` contains an unmatched no-op `watch`. It has no behavior
  and unfairly enlarges Vue; remove it.
- Vue defaults `__VUE_OPTIONS_API__` to `true`. Vue officially recommends
  disabling it when an application exclusively uses Composition API, allowing
  unused compatibility code to tree-shake.
- Svelte defaults `discloseVersion` to `true`, adding browser-visible framework
  version metadata. Setting it to `false` is a legitimate production trim.
- A defensible sensitivity comparison should therefore report:
  1. default official plugin production settings; and
  2. app-informed trimmed settings: Vue Options API disabled and Svelte version
     disclosure disabled.

## Measured corrections

- Converting the four hand-authored Svelte dynamic classes to object-valued
  `class` increased the complete eight-route Brotli result from 25,749 B to
  25,863 B: **+114 B**.
- Removing the unmatched Vue no-op watcher reduced the complete eight-route
  Brotli result from 33,353 B to 33,339 B: **−14 B**.
- Using shallow replacement state for the one replace-only notification array
  reduces Vue by another 59 B and Svelte by 20 B at the full application.
- The corrected default hand-authored result is therefore Vue 33,280 B versus
  Svelte 25,843 B, a 7,437 B Svelte advantage.
- The class conversion changes the controlled generated curves in
  compression-sensitive, non-monotonic ways. It does not produce a general
  Svelte size improvement.

## Measured configuration sensitivity

The trimmed profile changes only supported compiler configuration:

- Vue: `features.optionsAPI: false`
- Svelte: `compilerOptions.discloseVersion: false`

In the generated route-split workload:

| Measurement | Default | Trimmed |
| --- | ---: | ---: |
| gzip crossover | ≈ 237.1 definitions | ≈ 171.0 definitions |
| Brotli crossover | ≈ 337.6 definitions | ≈ 242.9 definitions |
| Vue advantage at 512 definitions, Brotli | 4,498 B | 7,279 B |

In the 33-definition hand-authored application:

| Measurement | Default | Trimmed |
| --- | ---: | ---: |
| Vue complete Brotli | 33,280 B | 31,681 B |
| Svelte complete Brotli | 25,843 B | 25,820 B |
| Svelte advantage | 7,437 B | 5,861 B |

The default result already establishes the amortization mechanism. The
trimmed profile shows that an app-informed, symmetric configuration moves the
crossover earlier because Vue's unused compatibility surface is substantially
larger than Svelte's removable version disclosure.

## Conclusion

“The Svelte fixture was written badly” is not supported by the audited facts:

1. the source uses the current Svelte 5 model;
2. the compiler emits zero warnings for all hand-authored components;
3. current official class guidance was adopted even though it makes Svelte
   slightly larger here;
4. the one behavior-free Vue excess was removed;
5. both default and symmetric trimmed profiles are published; and
6. both implementations remain subject to the same browser behavior contract.

This does not prove that no alternate Svelte expression could ever save a byte.
It does make any further objection concrete: a critic must provide a
behavior-equivalent patch and demonstrate its measured effect.

## Decision rule

An optimization lane is warranted only if it is:

1. recommended or clearly supported by current first-party guidance;
2. behaviorally equivalent;
3. applicable without framework-specific hand-deletion of required behavior;
4. paired with the corresponding Vue optimization when one exists; and
5. large enough to affect the benchmark conclusion after production
   minification and compression.
