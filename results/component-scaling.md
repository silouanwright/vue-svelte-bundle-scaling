# Vue 3.5 and Svelte 5 Bundle-Scaling Results

Generated: 2026-07-27T15:30:51.701Z

- Node: v22.19.0
- Vite: 8.1.5
- Vue: 3.5.40
- Svelte: 5.56.8
- Vue plugin: 6.0.8
- Svelte plugin: 7.2.0
- Minifier: Vite 8 Oxc production minification
- Compression: gzip level 9 and Brotli quality 11

The tables below report the total Brotli-compressed JavaScript emitted by
each production build. Positive deltas mean the Vue bundle is larger;
negative deltas mean the Vue bundle is smaller.

## counter: csr

| Distinct components | Vue | Svelte | Vue − Svelte |
| ---: | ---: | ---: | ---: |
| 0 | 21,190 B | 8,403 B | +12,787 B |
| 1 | 21,636 B | 11,010 B | +10,626 B |
| 2 | 21,694 B | 11,043 B | +10,651 B |
| 5 | 21,788 B | 11,151 B | +10,637 B |
| 10 | 21,865 B | 11,294 B | +10,571 B |
| 20 | 22,075 B | 11,573 B | +10,502 B |
| 40 | 22,275 B | 11,926 B | +10,349 B |
| 80 | 22,770 B | 12,844 B | +9,926 B |
| 160 | 24,069 B | 14,442 B | +9,627 B |
| 320 | 26,152 B | 17,327 B | +8,825 B |
| 640 | 29,653 B | 22,700 B | +6,953 B |

Descriptive linear fit from 1 through 640 components: Vue ≈ 21781.2 + 12.6 bytes/component; Svelte ≈ 11184.5 + 18.4 bytes/component.

No Vue-from-larger-to-smaller crossover appeared within the sampled component counts.

### Growth by size metric

| Metric | Vue bytes/component | Svelte bytes/component | Observed Vue crossover |
| --- | ---: | ---: | --- |
| raw | 505.3 | 597.3 | ≈ 323.3 |
| gzip | 28.7 | 40.6 | none sampled |
| brotli | 12.6 | 18.4 | none sampled |

## counter: hydrate

| Distinct components | Vue | Svelte | Vue − Svelte |
| ---: | ---: | ---: | ---: |
| 0 | 22,818 B | 9,013 B | +13,805 B |
| 1 | 23,272 B | 11,207 B | +12,065 B |
| 2 | 23,286 B | 11,245 B | +12,041 B |
| 5 | 23,384 B | 11,336 B | +12,048 B |
| 10 | 23,485 B | 11,485 B | +12,000 B |
| 20 | 23,612 B | 11,705 B | +11,907 B |
| 40 | 23,888 B | 12,127 B | +11,761 B |
| 80 | 24,372 B | 12,985 B | +11,387 B |
| 160 | 25,599 B | 14,622 B | +10,977 B |
| 320 | 27,396 B | 17,539 B | +9,857 B |
| 640 | 30,707 B | 22,798 B | +7,909 B |

Descriptive linear fit from 1 through 640 components: Vue ≈ 23400.5 + 11.7 bytes/component; Svelte ≈ 11370.9 + 18.3 bytes/component.

No Vue-from-larger-to-smaller crossover appeared within the sampled component counts.

### Growth by size metric

| Metric | Vue bytes/component | Svelte bytes/component | Observed Vue crossover |
| --- | ---: | ---: | --- |
| raw | 505.3 | 597.3 | ≈ 365.9 |
| gzip | 29.3 | 40.6 | none sampled |
| brotli | 11.7 | 18.3 | none sampled |

## counter: ssr

| Distinct components | Vue | Svelte | Vue − Svelte |
| ---: | ---: | ---: | ---: |
| 0 | 167,539 B | 7,310 B | +160,229 B |
| 1 | 167,728 B | 7,545 B | +160,183 B |
| 2 | 167,734 B | 7,555 B | +160,179 B |
| 5 | 167,829 B | 7,615 B | +160,214 B |
| 10 | 168,047 B | 7,681 B | +160,366 B |
| 20 | 168,269 B | 7,796 B | +160,473 B |
| 40 | 168,626 B | 7,994 B | +160,632 B |
| 80 | 169,382 B | 8,349 B | +161,033 B |
| 160 | 170,702 B | 9,054 B | +161,648 B |
| 320 | 173,119 B | 10,319 B | +162,800 B |
| 640 | 177,613 B | 12,443 B | +165,170 B |

Descriptive linear fit from 1 through 640 components: Vue ≈ 167925.8 + 15.5 bytes/component; Svelte ≈ 7647.0 + 7.7 bytes/component.

No Vue-from-larger-to-smaller crossover appeared within the sampled component counts.

### Growth by size metric

| Metric | Vue bytes/component | Svelte bytes/component | Observed Vue crossover |
| --- | ---: | ---: | --- |
| raw | 736.1 | 420.5 | none sampled |
| gzip | 36.7 | 19.4 | none sampled |
| brotli | 15.5 | 7.7 | none sampled |

## todo: csr

| Distinct components | Vue | Svelte | Vue − Svelte |
| ---: | ---: | ---: | ---: |
| 0 | 21,163 B | 8,403 B | +12,760 B |
| 1 | 23,183 B | 13,948 B | +9,235 B |
| 2 | 23,313 B | 14,069 B | +9,244 B |
| 5 | 23,563 B | 14,261 B | +9,302 B |
| 10 | 23,918 B | 14,472 B | +9,446 B |
| 20 | 24,494 B | 14,931 B | +9,563 B |
| 40 | 25,684 B | 15,772 B | +9,912 B |
| 80 | 27,920 B | 17,371 B | +10,549 B |
| 160 | 32,096 B | 20,772 B | +11,324 B |
| 320 | 40,518 B | 26,421 B | +14,097 B |
| 640 | 56,114 B | 38,183 B | +17,931 B |

Descriptive linear fit from 1 through 640 components: Vue ≈ 23487.0 + 51.6 bytes/component; Svelte ≈ 14184.1 + 37.8 bytes/component.

No Vue-from-larger-to-smaller crossover appeared within the sampled component counts.

### Growth by size metric

| Metric | Vue bytes/component | Svelte bytes/component | Observed Vue crossover |
| --- | ---: | ---: | --- |
| raw | 1996.3 | 2064.8 | ≈ 354.4 |
| gzip | 119.3 | 90.8 | none sampled |
| brotli | 51.6 | 37.8 | none sampled |

## todo: hydrate

| Distinct components | Vue | Svelte | Vue − Svelte |
| ---: | ---: | ---: | ---: |
| 0 | 22,827 B | 9,015 B | +13,812 B |
| 1 | 24,793 B | 14,125 B | +10,668 B |
| 2 | 24,907 B | 14,224 B | +10,683 B |
| 5 | 25,151 B | 14,417 B | +10,734 B |
| 10 | 25,441 B | 14,666 B | +10,775 B |
| 20 | 26,132 B | 15,109 B | +11,023 B |
| 40 | 27,236 B | 15,984 B | +11,252 B |
| 80 | 29,573 B | 17,586 B | +11,987 B |
| 160 | 33,786 B | 20,824 B | +12,962 B |
| 320 | 42,440 B | 26,773 B | +15,667 B |
| 640 | 57,762 B | 38,198 B | +19,564 B |

Descriptive linear fit from 1 through 640 components: Vue ≈ 25096.4 + 51.8 bytes/component; Svelte ≈ 14373.1 + 37.7 bytes/component.

No Vue-from-larger-to-smaller crossover appeared within the sampled component counts.

### Growth by size metric

| Metric | Vue bytes/component | Svelte bytes/component | Observed Vue crossover |
| --- | ---: | ---: | --- |
| raw | 1996.4 | 2064.8 | ≈ 419.1 |
| gzip | 120.0 | 90.8 | none sampled |
| brotli | 51.8 | 37.7 | none sampled |

## todo: ssr

| Distinct components | Vue | Svelte | Vue − Svelte |
| ---: | ---: | ---: | ---: |
| 0 | 167,589 B | 7,314 B | +160,275 B |
| 1 | 168,138 B | 7,895 B | +160,243 B |
| 2 | 168,176 B | 7,875 B | +160,301 B |
| 5 | 168,231 B | 7,966 B | +160,265 B |
| 10 | 168,451 B | 8,069 B | +160,382 B |
| 20 | 168,918 B | 8,259 B | +160,659 B |
| 40 | 169,418 B | 8,518 B | +160,900 B |
| 80 | 170,543 B | 9,064 B | +161,479 B |
| 160 | 172,751 B | 10,191 B | +162,560 B |
| 320 | 176,467 B | 12,219 B | +164,248 B |
| 640 | 182,631 B | 15,573 B | +167,058 B |

Descriptive linear fit from 1 through 640 components: Vue ≈ 168431.7 + 23.0 bytes/component; Svelte ≈ 8006.8 + 12.2 bytes/component.

No Vue-from-larger-to-smaller crossover appeared within the sampled component counts.

### Growth by size metric

| Metric | Vue bytes/component | Svelte bytes/component | Observed Vue crossover |
| --- | ---: | ---: | --- |
| raw | 1967.1 | 1328.6 | none sampled |
| gzip | 65.5 | 38.1 | none sampled |
| brotli | 23.0 | 12.2 | none sampled |

## Compression diagnostic

The repeated-component cases become progressively easier to compress. This
table reports Brotli size as a percentage of raw JavaScript for CSR builds;
a falling percentage means repetition is contributing more of the apparent
bundle-size efficiency.

| Workload | Components | Vue | Svelte |
| --- | ---: | ---: | ---: |
| counter | 1 | 35.7% | 35.5% |
| counter | 20 | 31.4% | 27.3% |
| counter | 80 | 22.7% | 16.5% |
| counter | 640 | 7.7% | 5.5% |
| todo | 1 | 35.6% | 35.3% |
| todo | 20 | 23.9% | 19.0% |
| todo | 80 | 12.6% | 8.6% |
| todo | 640 | 4.2% | 2.8% |

At high counts these near-cloned components compress far more effectively
than heterogeneous production code should be assumed to compress. The raw
curve and the compressed curve therefore bound different questions; neither
is a standalone prediction for a real application.

## Interpretation

Read these measurements with the methodology and limitations in `README.md`.
The CSR and hydration lanes are browser-transfer comparisons. The SSR lane
measures a bundled server artifact and is included only to examine generated
server code. Exact thresholds are workload-sensitive and should not be
presented as permanent properties of either framework.
