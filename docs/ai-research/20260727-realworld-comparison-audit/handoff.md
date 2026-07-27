# Research Handoff: Real-World Comparison Audit

## Goal

Audit the independent Vue/Svelte comparison before using it to reposition the
lead chart's illustrated crossover.

## Current conclusion

The terminal result reproduced, but 76.088 kB gzip / 63.215 kB Brotli is
byte-identical shared xterm JavaScript. Default Vue framework + app code is
25.566 kB gzip versus Svelte's 13.131 kB; disabling Vue's unused Options API
reduces Vue to 22.331 kB. This corroborates Svelte's small-app advantage but
does not locate a framework-code crossover near 100 kB.

The lead chart measures complete production transfer, so it now includes the
Composition-only complete terminal builds: 86.265 kB Brotli for Vue and 77.671
kB for Svelte. Treat the resulting curve as an interpolation across measured
applications, not a universal size threshold.

## Key evidence

- Pinned source:
  `naufalafif/realworld-js-framework-comparison@2c338de860222deba6b842260cfbec6609c272bd`
- Reproduction and diagnostic tables:
  `findings.md`
- Local audit checkout:
  `/tmp/realworld-js-framework-comparison-audit`

## Open gaps

The shared terminal Playwright test remains shallower than the OpenSlides
parity suite.

## Resume prompt

Read `findings.md` first. Preserve the distinction between complete production
transfer and framework/application code.
