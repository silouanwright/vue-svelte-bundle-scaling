# Research Handoff: Real-World Comparison Audit

## Goal

Audit the independent Vue/Svelte comparison before using it to reposition the
lead chart's illustrated crossover.

## Current conclusion

The terminal result reproduced, but 76.088 kB gzip / 63.215 kB Brotli is
byte-identical shared xterm JavaScript. Default Vue framework + app code is
25.566 kB gzip versus Svelte's 13.131 kB; disabling Vue's unused Options API
reduces Vue to 22.331 kB. This corroborates Svelte's small-app advantage but
does not locate a crossover near 100 kB.

Do not move the lead chart's illustrated crossover because of this source.

## Key evidence

- Pinned source:
  `naufalafif/realworld-js-framework-comparison@2c338de860222deba6b842260cfbec6609c272bd`
- Reproduction and diagnostic tables:
  `findings.md`
- Local audit checkout:
  `/tmp/realworld-js-framework-comparison-audit`

## Open gaps

None for the chart decision. The shared terminal Playwright test remains
shallower than the OpenSlides parity suite.

## Resume prompt

Read `findings.md` first. Do not treat the ~100 kB terminal total as 100 kB of
framework/application code.
