# What the Measurements Support

## Conclusion

Evan You’s [2021 analysis](https://github.com/yyx990803/vue-svelte-size-analysis)
identified a real architectural tradeoff. Vue paid a
larger shared runtime cost while emitting less code for the TodoMVC component
under examination. With Vue 3.5, Svelte 5, and Vite 8, both parts of that
tradeoff remain visible—but the current bundle-size story is not captured by
the old 13- or 19-component crossover estimates.

The evidence in this repository supports five conclusions:

1. Vue still emits less isolated code for the original component specimen.
2. Svelte remains substantially smaller in the small complete applications
   measured here.
3. Vue’s raw client-code growth can be lower and can repay its larger runtime.
4. Whole-bundle compression can delay or reverse that raw crossover when
   hundreds of components repeat similar compiler output.
5. Vue’s amortization can become a gzip and Brotli advantage when diverse code
   is divided among independently compressed lazy routes.

That final result is an existence proof, not a new universal threshold. The
application, compiler, component structures, chunk boundaries, minifier, and
compression model jointly determine the transferred bytes.

## 1. The original specimen still favors Vue’s compiler output

The exact TodoMVC source files from the 2021 study were compiled with Vue
3.5.40, Svelte 5.56.8, and Vite 8.1.5. Vue required the documented hook rename
from `@vnode-mounted` to `@vue:mounted`; the legacy Svelte source was accepted
unchanged.

After removing shared import and export syntax, the isolated component output
was:

| Component-only output | Vue | Svelte | Svelte over Vue |
| --- | ---: | ---: | ---: |
| Raw | 3,802 B | 5,213 B | 37% |
| gzip | 1,484 B | 1,762 B | 19% |
| Brotli | 1,306 B | 1,500 B | 15% |

The original analysis reported a much larger Brotli difference—approximately
71% for its compiler versions and specimen calculation. Current Svelte has
closed most of that isolated compressed-output gap, but has not erased it.

The complete one-component browser bundles tell the other half of the story:

| Browser lane | Vue Brotli | Svelte Brotli | Svelte advantage |
| --- | ---: | ---: | ---: |
| Client mount | 23,445 B | 14,407 B | 9,038 B |
| Hydration client | 25,078 B | 14,587 B | 10,491 B |

Vue’s smaller component output is not the same as a smaller application. The
shared runtime dominates at this scale, and Svelte wins decisively.

The historical study’s “SSR” browser calculation corresponds most closely to
this repository’s hydration-capable client, not its separate bundled
server-rendering program. Those artifacts should not be conflated.

## 2. Raw amortization is real, but compressed near-clones favor Svelte

The controlled benchmark builds complete applications containing up to 640
distinct modules. It does not estimate a bundle by multiplying one component.

For client rendering, Vue crossed from larger to smaller **raw minified
JavaScript** near:

- 323 counter definitions;
- 354 Todo-style definitions.

The hydration-client raw crossovers appeared near 366 and 419 definitions.
This confirms the architectural mechanism: in these workloads, Vue’s larger
client runtime is eventually repaid by smaller raw increments.

No gzip or Brotli crossover appeared through 640 definitions. The direction
even depended on component shape:

- With counters, Vue’s compressed disadvantage narrowed.
- With the larger Todo shape, Vue’s compressed disadvantage grew.

The compression ratios explain why. One-component CSR builds compressed to
roughly 35% of raw JavaScript for both frameworks. At 640 near-cloned Todo
components, Vue compressed to 4.2% and Svelte to 2.8%. Svelte’s larger repeated
patterns were extraordinarily compressible.

Those ratios should not be projected onto ordinary product code. The lane is
still valuable because it demonstrates that “less raw generated code” does not
automatically mean “fewer transferred bytes.”

## 3. Evan You’s arithmetic was a model, not a whole-app build

The 2021 analysis compressed one TodoMVC component and multiplied its cost to
estimate a crossover. That was not a measurement error in the component
comparison: it clearly isolated the fixed runtime and marginal component
output it intended to discuss.

It was, however, a simplifying assumption when extended to a complete
application:

```text
estimated compressed application
  = compressed runtime
  + component count × compressed isolated component
```

Compressed sizes are not generally additive. If many components share emitted
patterns inside one response, later patterns cost less than the first. If
components live in separate lazy responses, they cannot all share the same
dictionary. The original estimate therefore described a useful architectural
model; it did not establish an empirical whole-application crossover.

The modern controlled lane proves why the distinction matters. Multiplying
isolated compressed costs predicts neither framework’s actual whole-bundle
curve once hundreds of definitions are minified and compressed together.

## 4. Vue can become smaller as route-loaded components accumulate

The primary scaling workload introduces eight kinds of component behavior:
counters, disclosures, tabs, task trackers, search panels, settings forms,
pagination controls, and notifications. Each lazy route contains one of each.
Every emitted JavaScript response is compressed independently.

| Components | Routes | Vue Brotli | Svelte Brotli | Vue − Svelte |
| ---: | ---: | ---: | ---: | ---: |
| 0 | 0 | 21,837 B | 11,347 B | +10,490 B |
| 128 | 16 | 46,882 B | 41,234 B | +5,648 B |
| 256 | 32 | 70,154 B | 68,050 B | +2,104 B |
| 512 | 64 | 117,254 B | 121,752 B | −4,498 B |

Linear interpolation between the sampled default-profile builds places the
crossover near 237 compact component definitions for gzip and 338 for Brotli
in this workload.

![Svelte uses fewer source lines in the matched fixture, while Vue eventually transfers less JavaScript](docs/images/route-split-brotli.svg)

The opening chart uses the Composition-only production profile: Vue’s unused
Options API is disabled, and Svelte’s version disclosure is disabled. It
positions each framework by its own nonblank source-line count. Piecewise-linear
interpolation gives an imperfect estimate of the two curves’ source-size
crossover: approximately 1,560 lines and 36.8 kB transferred in this fixture.
This is intentionally a different question from the
matched-workload crossover: equal source-line counts do not represent exactly
equal functionality because Svelte expresses this fixture more tersely.

For legibility, the chart begins with the 64-definition sample: 940 Svelte
lines and 1,159 Vue lines. The complete reports retain the empty-shell and
8–32-definition measurements.

At each substantial matched sample, Svelte uses about 19% fewer nonblank source
lines. In the Composition-only profile, the same-behavior Brotli crossover is
near 243 compact definitions, which correspond to approximately 4,330 Vue
lines or 3,510 Svelte lines. The
ordinary source-size chart makes the scale easier to imagine; the matched
benchmark establishes the controlled framework comparison.

Those numbers belong to this generated workload. The important result is
mechanical: Vue’s amortization was not limited to uncompressed output. It
survived network compression once route boundaries prevented all repeated
compiler patterns from sharing a single global dictionary.

The diagnostic makes that mechanism visible. At 512 components, the sum of
independently compressed route responses was 117,254 B for Vue and 121,752 B
for Svelte. When the same emitted files were artificially concatenated and
compressed once, the totals became 29,059 B and 19,582 B respectively. Svelte
benefited dramatically more from the global repetition.

Neither number is “the true bundle size” without a delivery model. The first
models a cold traversal across independent route responses. The second models
one hypothetical response. Real applications occupy many points between them.

## 5. Two complete small applications still favor Svelte

The current keyed Vue and Svelte implementations from
[`js-framework-benchmark`](https://github.com/krausest/js-framework-benchmark)
were fetched at a pinned commit and rebuilt with the same Vite target,
minifier, and compression settings:

| Total emitted JavaScript | Vue | Svelte | Svelte advantage |
| --- | ---: | ---: | ---: |
| Raw | 63,652 B | 35,566 B | 28,086 B |
| gzip | 24,740 B | 13,957 B | 10,783 B |
| Brotli | 22,573 B | 12,654 B | 9,919 B |

This comparison is independently maintained and behavior-matched, but it is a
deliberately small performance app. It answers the small-complete-application
question, not the scaling question.

The second small application provides a different check. Its components were
written individually rather than produced by the scaling generator, which is
what “hand-authored” means in the raw report filenames. Its framework-neutral
specification defines eight product routes, 24 independently designed leaf
components, seven lazy boundaries, shared application state shapes, and a
browser-tested behavior contract.

| Routes | Definitions | Vue Brotli | Svelte Brotli | Vue − Svelte |
| ---: | ---: | ---: | ---: | ---: |
| 1 | 5 | 23,560 B | 13,992 B | +9,568 B |
| 2 | 9 | 26,247 B | 17,110 B | +9,137 B |
| 4 | 17 | 28,853 B | 20,865 B | +7,988 B |
| 8 | 33 | 33,280 B | 25,843 B | +7,437 B |

Svelte remains smaller initially and across a cold traversal of every route.
At the full eight-route point:

- initial Brotli: Vue 25,565 B; Svelte 17,281 B;
- complete Brotli: Vue 33,280 B; Svelte 25,843 B.

The complete gap narrows by 2,131 B as the fixture grows from 5 to 33
definitions. All seven individual lazy route chunks are smaller in Vue after
Brotli—by 39–213 B each—but the larger initial runtime is not repaid in this
application. Chunk allocation is bundler-dependent, so those route increments
should not be mistaken for framework-free component output; they do show why
the complete gap narrows.

The individually written application also passes a useful realism check. Its
per-response Brotli totals are 35.9% of raw JavaScript for Vue and 36.8% for
Svelte—close to the one-component ratios and far from the clone-heavy Todo
lane’s 4.2% and 2.8%. Coalescing every route lowers those ratios to 32.9% and
32.8%, which quantifies the smaller, credible amount of repetition split
across its route responses.

This is precisely the kind of negative result the study needs. The harness was
not built to force a Vue crossover. It shows both the direction of marginal
growth and the scale at which Svelte still wins.

## 6. Supported production trimming moves the crossover earlier

The primary reports use the official Vite plugin defaults. A second profile
tests one supported, behavior-preserving production trim for each framework:
Vue disables its unused Options API, while Svelte disables browser-visible
version disclosure.

| Measurement | Default | Trimmed |
| --- | ---: | ---: |
| Route-split gzip crossover | ≈ 237 definitions | ≈ 171 definitions |
| Route-split Brotli crossover | ≈ 338 definitions | ≈ 243 definitions |
| Complete 33-definition Vue − Svelte gap | +7,437 B | +5,861 B |

The result is asymmetric because the optional surfaces are asymmetric. Vue’s
compatibility-oriented default carries substantially more removable code than
Svelte’s version marker. This sensitivity does not manufacture the
amortization curve—the default profile already crosses—but it demonstrates
that comparing a deliberately trimmed Svelte build to Vue’s default would be
an avoidable configuration bias.

## 7. Svelte 5 changes the historical framing

It is no longer precise to describe modern Svelte as merely “the framework
without a runtime.” Svelte 5 uses shared runtime machinery and signals while
continuing to compile component-specific operations. Its architecture has
moved, in part, toward amortizing common behavior, as Svelte’s own
[release account](https://svelte.dev/blog/svelte-5-is-alive) explains.

That evolution does not invalidate the 2021 question. It makes rerunning the
measurement necessary. Moving work into a compiler changes where code is
generated and how it scales; it does not make all framework work disappear.
Modern Vue and Svelte both combine compiler and runtime techniques, with
different balances.

## 7. The strongest defensible formulation

A publication using these results can say:

> Svelte’s small-runtime advantage is real in small complete applications.
> Vue’s lower generated client-code growth is also real. The old 13- or
> 19-component estimates do not survive as current empirical thresholds:
> compression and chunking move the boundary. Complete clone-heavy bundles
> remained smaller with Svelte after gzip and Brotli, even when Vue became
> smaller in raw JavaScript.
>
> When I introduced eight component families and compressed lazy route chunks
> as separate responses, Vue eventually became smaller in gzip and Brotli.
> A separate, individually written 33-component application did not cross,
> although most of its lazy route increments favored Vue and the complete gap
> narrowed.
> The evidence therefore supports Svelte as the likely size winner for widgets
> and small applications, and Vue as the likely smaller framework layer for
> medium-to-large applications with many distinct, independently transferred
> features. That is an application-shape prediction, not a universal component
> count.

That is a stronger argument than either “Svelte compiles away the framework”
or a recycled historical threshold. It acknowledges Svelte’s measured
advantage where it exists, demonstrates that Vue’s runtime is genuinely
amortizable after transport compression, and states the product shape in which
that tradeoff is likely to pay off.

## Decision-grade testing for a real product

The next test for a particular framework decision is not another generic
counter. Port the same representative product slice and include:

- structurally different components;
- extracted reactive logic and shared state;
- actual lazy-route and manual-chunk boundaries;
- required editors, grids, validation, charts, and component libraries;
- the production browser target and minifier;
- the deployment platform’s compression;
- initial-route, common-navigation, and complete-cold-traversal totals.

Even that result belongs to the selected product. Framework bundle size is an
application property, not a slogan.
