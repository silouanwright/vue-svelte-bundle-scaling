# Vue 3.5 and Svelte 5 Bundle-Scaling Results

Generated: 2026-07-27T11:28:05.347Z

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
| 1 | 21,636 B | 10,878 B | +10,758 B |
| 2 | 21,694 B | 10,934 B | +10,760 B |
| 5 | 21,788 B | 11,039 B | +10,749 B |
| 10 | 21,865 B | 11,170 B | +10,695 B |
| 20 | 22,075 B | 11,431 B | +10,644 B |
| 40 | 22,275 B | 11,873 B | +10,402 B |
| 80 | 22,770 B | 12,806 B | +9,964 B |
| 160 | 24,069 B | 14,488 B | +9,581 B |
| 320 | 26,152 B | 17,574 B | +8,578 B |
| 640 | 29,653 B | 23,154 B | +6,499 B |

Descriptive linear fit from 1 through 640 components: Vue ≈ 21781.2 + 12.6 bytes/component; Svelte ≈ 11067.3 + 19.3 bytes/component.

No Vue-from-larger-to-smaller crossover appeared within the sampled component counts.

### Growth by size metric

| Metric | Vue bytes/component | Svelte bytes/component | Observed Vue crossover |
| --- | ---: | ---: | --- |
| raw | 505.3 | 616.3 | ≈ 271.7 |
| gzip | 28.7 | 40.6 | none sampled |
| brotli | 12.6 | 19.3 | none sampled |

## counter: hydrate

| Distinct components | Vue | Svelte | Vue − Svelte |
| ---: | ---: | ---: | ---: |
| 0 | 22,818 B | 9,013 B | +13,805 B |
| 1 | 23,272 B | 11,066 B | +12,206 B |
| 2 | 23,286 B | 11,114 B | +12,172 B |
| 5 | 23,384 B | 11,221 B | +12,163 B |
| 10 | 23,485 B | 11,351 B | +12,134 B |
| 20 | 23,612 B | 11,618 B | +11,994 B |
| 40 | 23,888 B | 12,052 B | +11,836 B |
| 80 | 24,372 B | 12,964 B | +11,408 B |
| 160 | 25,599 B | 14,586 B | +11,013 B |
| 320 | 27,396 B | 17,745 B | +9,651 B |
| 640 | 30,707 B | 23,470 B | +7,237 B |

Descriptive linear fit from 1 through 640 components: Vue ≈ 23400.5 + 11.7 bytes/component; Svelte ≈ 11229.8 + 19.5 bytes/component.

No Vue-from-larger-to-smaller crossover appeared within the sampled component counts.

### Growth by size metric

| Metric | Vue bytes/component | Svelte bytes/component | Observed Vue crossover |
| --- | ---: | ---: | --- |
| raw | 505.3 | 616.3 | ≈ 307.1 |
| gzip | 29.3 | 40.6 | none sampled |
| brotli | 11.7 | 19.5 | none sampled |

## counter: ssr

| Distinct components | Vue | Svelte | Vue − Svelte |
| ---: | ---: | ---: | ---: |
| 0 | 167,539 B | 7,310 B | +160,229 B |
| 1 | 167,728 B | 7,563 B | +160,165 B |
| 2 | 167,734 B | 7,557 B | +160,177 B |
| 5 | 167,829 B | 7,615 B | +160,214 B |
| 10 | 168,047 B | 7,726 B | +160,321 B |
| 20 | 168,269 B | 7,831 B | +160,438 B |
| 40 | 168,626 B | 8,005 B | +160,621 B |
| 80 | 169,382 B | 8,348 B | +161,034 B |
| 160 | 170,702 B | 9,017 B | +161,685 B |
| 320 | 173,119 B | 10,170 B | +162,949 B |
| 640 | 177,613 B | 12,482 B | +165,131 B |

Descriptive linear fit from 1 through 640 components: Vue ≈ 167925.8 + 15.5 bytes/component; Svelte ≈ 7650.8 + 7.7 bytes/component.

No Vue-from-larger-to-smaller crossover appeared within the sampled component counts.

### Growth by size metric

| Metric | Vue bytes/component | Svelte bytes/component | Observed Vue crossover |
| --- | ---: | ---: | --- |
| raw | 736.1 | 427.5 | none sampled |
| gzip | 36.7 | 19.3 | none sampled |
| brotli | 15.5 | 7.7 | none sampled |

## todo: csr

| Distinct components | Vue | Svelte | Vue − Svelte |
| ---: | ---: | ---: | ---: |
| 0 | 21,163 B | 8,403 B | +12,760 B |
| 1 | 23,183 B | 13,829 B | +9,354 B |
| 2 | 23,313 B | 13,919 B | +9,394 B |
| 5 | 23,563 B | 14,133 B | +9,430 B |
| 10 | 23,918 B | 14,366 B | +9,552 B |
| 20 | 24,494 B | 14,756 B | +9,738 B |
| 40 | 25,684 B | 15,608 B | +10,076 B |
| 80 | 27,920 B | 17,296 B | +10,624 B |
| 160 | 32,096 B | 20,608 B | +11,488 B |
| 320 | 40,518 B | 26,248 B | +14,270 B |
| 640 | 56,114 B | 38,107 B | +18,007 B |

Descriptive linear fit from 1 through 640 components: Vue ≈ 23487.0 + 51.6 bytes/component; Svelte ≈ 14043.9 + 37.9 bytes/component.

No Vue-from-larger-to-smaller crossover appeared within the sampled component counts.

### Growth by size metric

| Metric | Vue bytes/component | Svelte bytes/component | Observed Vue crossover |
| --- | ---: | ---: | --- |
| raw | 1996.3 | 2083.7 | ≈ 279.0 |
| gzip | 119.3 | 92.7 | none sampled |
| brotli | 51.6 | 37.9 | none sampled |

## todo: hydrate

| Distinct components | Vue | Svelte | Vue − Svelte |
| ---: | ---: | ---: | ---: |
| 0 | 22,827 B | 9,015 B | +13,812 B |
| 1 | 24,793 B | 14,000 B | +10,793 B |
| 2 | 24,907 B | 14,091 B | +10,816 B |
| 5 | 25,151 B | 14,281 B | +10,870 B |
| 10 | 25,441 B | 14,565 B | +10,876 B |
| 20 | 26,132 B | 14,952 B | +11,180 B |
| 40 | 27,236 B | 15,786 B | +11,450 B |
| 80 | 29,573 B | 17,491 B | +12,082 B |
| 160 | 33,786 B | 20,638 B | +13,148 B |
| 320 | 42,440 B | 26,521 B | +15,919 B |
| 640 | 57,762 B | 38,082 B | +19,680 B |

Descriptive linear fit from 1 through 640 components: Vue ≈ 25096.4 + 51.8 bytes/component; Svelte ≈ 14227.8 + 37.7 bytes/component.

No Vue-from-larger-to-smaller crossover appeared within the sampled component counts.

### Growth by size metric

| Metric | Vue bytes/component | Svelte bytes/component | Observed Vue crossover |
| --- | ---: | ---: | --- |
| raw | 1996.4 | 2083.7 | ≈ 325.9 |
| gzip | 120.0 | 92.7 | none sampled |
| brotli | 51.8 | 37.7 | none sampled |

## todo: ssr

| Distinct components | Vue | Svelte | Vue − Svelte |
| ---: | ---: | ---: | ---: |
| 0 | 167,589 B | 7,314 B | +160,275 B |
| 1 | 168,138 B | 7,851 B | +160,287 B |
| 2 | 168,176 B | 7,900 B | +160,276 B |
| 5 | 168,231 B | 7,969 B | +160,262 B |
| 10 | 168,451 B | 8,081 B | +160,370 B |
| 20 | 168,918 B | 8,237 B | +160,681 B |
| 40 | 169,418 B | 8,530 B | +160,888 B |
| 80 | 170,543 B | 9,081 B | +161,462 B |
| 160 | 172,751 B | 10,183 B | +162,568 B |
| 320 | 176,467 B | 12,248 B | +164,219 B |
| 640 | 182,631 B | 15,646 B | +166,985 B |

Descriptive linear fit from 1 through 640 components: Vue ≈ 168431.7 + 23.0 bytes/component; Svelte ≈ 8001.8 + 12.3 bytes/component.

No Vue-from-larger-to-smaller crossover appeared within the sampled component counts.

### Growth by size metric

| Metric | Vue bytes/component | Svelte bytes/component | Observed Vue crossover |
| --- | ---: | ---: | --- |
| raw | 1967.1 | 1335.6 | none sampled |
| gzip | 65.5 | 38.1 | none sampled |
| brotli | 23.0 | 12.3 | none sampled |

## Compression diagnostic

The repeated-component cases become progressively easier to compress. This
table reports Brotli size as a percentage of raw JavaScript for CSR builds;
a falling percentage means repetition is contributing more of the apparent
bundle-size efficiency.

| Workload | Components | Vue | Svelte |
| --- | ---: | ---: | ---: |
| counter | 1 | 35.7% | 35.5% |
| counter | 20 | 31.4% | 27.0% |
| counter | 80 | 22.7% | 16.2% |
| counter | 640 | 7.7% | 5.5% |
| todo | 1 | 35.6% | 35.4% |
| todo | 20 | 23.9% | 18.8% |
| todo | 80 | 12.6% | 8.5% |
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
