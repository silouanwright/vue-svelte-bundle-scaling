# Findings: Real-World Comparison Audit

## Research question

Does the independent terminal application legitimately show Svelte remaining
smaller near a 100 kB transferred payload, and should that move the lead
chart's illustrated crossover?

## Current conclusion

The published terminal result is reproducible and the implementations are
credible equivalents. It is a valid point in a graph of complete production
transfer, but it must not be interpreted as locating an application-code
crossover near 100 kB. Roughly 76 kB gzip of both bundles is byte-identical
`xterm` code. The framework plus application layer remains a small comparison:
about 25.6 kB for default Vue, 22.3 kB for Composition-only Vue, and 13.1 kB
for Svelte.

## Reproduction

Pinned commit:
`2c338de860222deba6b842260cfbec6609c272bd`.

Resolved versions include Vue 3.5.31, Svelte 5.55.0, Vite 6.4.1, and xterm
5.5.0. Both terminal applications use plain Vite; the Svelte terminal does not
use SvelteKit.

The unmodified production builds measured:

| JavaScript | Vue | Svelte | Vue − Svelte |
| --- | ---: | ---: | ---: |
| gzip level 9 | 101.523 kB | 89.064 kB | +12.459 kB |
| Brotli quality 11 | 86.104 kB | 74.663 kB | +11.441 kB |

This closely reproduces the repository's published 99.6 versus 87.4 KiB gzip
figures. The small difference comes from gzip settings and decimal kB versus
binary KiB display.

The CSS output was identical:

| CSS | Vue | Svelte |
| --- | ---: | ---: |
| gzip level 9 | 3.701 kB | 3.701 kB |
| Brotli quality 11 | 3.008 kB | 3.008 kB |

## Shared-dependency split

For the diagnostic build, both Vite configurations forced every `@xterm`
module into one vendor chunk. The resulting vendor JavaScript was
byte-identical:

| JavaScript layer | Vue | Svelte |
| --- | ---: | ---: |
| Shared xterm, gzip | 76.088 kB | 76.088 kB |
| Framework + app, gzip | 25.566 kB | 13.131 kB |
| Shared xterm, Brotli | 63.215 kB | 63.215 kB |
| Framework + app, Brotli | 23.159 kB | 11.811 kB |

The xterm CSS and application CSS chunks were also byte-identical.

Therefore 75% of the Vue JavaScript and 85% of the Svelte JavaScript in the
published result is shared terminal machinery. The observed framework
difference is real, but the total does not describe 100 kB of independently
growing Vue or Svelte application code.

## Vue configuration sensitivity

The Vue source uses `<script setup>` and Composition API only, but its default
Vite configuration leaves the Options API enabled. Disabling the unused
Options API and production diagnostics changed its framework + app chunk to:

| Composition-only Vue framework + app | Size |
| --- | ---: |
| gzip level 9 | 22.331 kB |
| Brotli quality 11 | 20.321 kB |

Svelte remained smaller by 9.200 kB gzip / 8.510 kB Brotli. The default Vue
configuration is not fraudulent or badly authored, but it leaves a legitimate
production optimization unused.

Rebuilding the complete production output without the diagnostic vendor split,
while retaining the Composition-only Vue configuration, measured:

| Complete JavaScript + CSS | Vue | Svelte | Vue − Svelte |
| --- | ---: | ---: | ---: |
| gzip level 9 | 102.054 kB | 92.765 kB | +9.289 kB |
| Brotli quality 11 | 86.265 kB | 77.671 kB | +8.594 kB |

## Source and behavior parity

The Vue and Svelte terminal components implement the same xterm construction,
addons, WebSocket lifecycle, resize messages, terminal input/output handlers,
connection indicator, and cleanup. The Svelte component uses current runes for
local state. Its larger inline framework logo slightly disadvantages Svelte.

The shared Playwright suite checks that the terminal UI and connection status
render, but does not verify terminal input/output. This is weaker than the
OpenSlides parity contract. Direct source comparison nevertheless shows close
behavioral equivalence.

## Dependency-light control

The repository's performance-table application has no xterm-sized shared
payload. Its reproduced JavaScript was:

| Performance app JavaScript | Vue | Svelte |
| --- | ---: | ---: |
| gzip level 9 | 28.814 kB | 18.538 kB |
| Brotli quality 11 | 26.100 kB | 16.711 kB |

This independently corroborates the controlled Weather Front result: Svelte
has a real advantage in small application/framework layers.

## Chart decision

Include the terminal as a second measured small-application point because the
lead chart measures complete production transfer, and the terminal total is a
legitimate observation of that quantity.

Do not describe it as proving that Svelte remains smaller through 100 kB of
framework-generated application code. The terminal is a small application
layer mounted on 76 kB of shared vendor code. It refines the complete-transfer
illustration between Weather Front and OpenSlides without locating a universal
framework-code crossover.
