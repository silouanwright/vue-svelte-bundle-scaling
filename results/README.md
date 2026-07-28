# Benchmark results

This directory contains the committed benchmark data and the corresponding
human-readable reports. Running a benchmark updates its JSON and Markdown pair.
`npm run verify` checks the normalized JSON artifacts against
[`results-lock.json`](results-lock.json).

| Benchmark lane | Report | Data |
| --- | --- | --- |
| Component scaling | [`component-scaling.md`](component-scaling.md) | [`component-scaling.json`](component-scaling.json) |
| Original 2021 TodoMVC specimen | [`original-specimen.md`](original-specimen.md) | [`original-specimen.json`](original-specimen.json) |
| Matched complete application | [`matched-app.md`](matched-app.md) | [`matched-app.json`](matched-app.json) |
| Route-split simulation | [`route-split.md`](route-split.md) | [`route-split.json`](route-split.json) |
| Route-split simulation, trimmed | [`route-split-trimmed.md`](route-split-trimmed.md) | [`route-split-trimmed.json`](route-split-trimmed.json) |
| Hand-authored application | [`hand-authored.md`](hand-authored.md) | [`hand-authored.json`](hand-authored.json) |
| Hand-authored application, trimmed | [`hand-authored-trimmed.md`](hand-authored-trimmed.md) | [`hand-authored-trimmed.json`](hand-authored-trimmed.json) |
| Upstream Weather Front | [`weather-upstream.md`](weather-upstream.md) | [`weather-upstream.json`](weather-upstream.json) |
| Controlled Weather Front | [`weather-staged.md`](weather-staged.md) | [`weather-staged.json`](weather-staged.json) |
| Independent terminal control | [`terminal-control.md`](terminal-control.md) | [`terminal-control.json`](terminal-control.json) |
| OpenSlides | [`openslides.md`](openslides.md) | [`openslides.json`](openslides.json) |
