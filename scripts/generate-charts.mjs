import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDir = path.join(root, "docs", "images");
fs.mkdirSync(outputDir, { recursive: true });

const colors = { vue: "#238a62", svelte: "#d93600" };
const width = 880;
const height = 500;
const margin = { top: 72, right: 42, bottom: 70, left: 86 };

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function interpolateSeries(xValues, yValues, targetX) {
  if (targetX < xValues[0] || targetX > xValues.at(-1)) {
    return null;
  }

  for (let index = 1; index < xValues.length; index += 1) {
    if (targetX <= xValues[index]) {
      const interval = xValues[index] - xValues[index - 1];
      const progress = (targetX - xValues[index - 1]) / interval;
      return (
        yValues[index - 1] +
        progress * (yValues[index] - yValues[index - 1])
      );
    }
  }

  return yValues.at(-1);
}

function piecewiseCrossover(first, second) {
  const minimum = Math.max(first.xValues[0], second.xValues[0]);
  const maximum = Math.min(first.xValues.at(-1), second.xValues.at(-1));
  const boundaries = [
    minimum,
    ...first.xValues.filter((value) => value > minimum && value < maximum),
    ...second.xValues.filter((value) => value > minimum && value < maximum),
    maximum,
  ].sort((left, right) => left - right);

  for (let index = 1; index < boundaries.length; index += 1) {
    const start = boundaries[index - 1];
    const end = boundaries[index];
    const startGap =
      interpolateSeries(first.xValues, first.values, start) -
      interpolateSeries(second.xValues, second.values, start);
    const endGap =
      interpolateSeries(first.xValues, first.values, end) -
      interpolateSeries(second.xValues, second.values, end);

    if (startGap === 0) {
      return start;
    }
    if (startGap > 0 && endGap <= 0) {
      return start + (startGap / (startGap - endGap)) * (end - start);
    }
  }

  return null;
}

function lineChart({
  title,
  description,
  xLabel,
  yLabel,
  xValues,
  xTickValues = xValues,
  series,
  verticalMarkers = [],
  callout = null,
  evidenceKey = null,
}) {
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  const maxX = Math.max(
    ...xValues,
    ...series.flatMap((item) => item.xValues ?? xValues),
  );
  const maxYValue = Math.max(...series.flatMap((item) => item.values));
  const maxY = Math.ceil(maxYValue / 20_000) * 20_000;
  const x = (value) =>
    Number((margin.left + (value / maxX) * plotWidth).toFixed(2));
  const y = (value) =>
    Number(
      (margin.top + plotHeight - (value / maxY) * plotHeight).toFixed(2),
    );
  const yTicks = Array.from({ length: 6 }, (_, index) => (maxY / 5) * index);

  const grid = yTicks
    .map(
      (value) => `
    <line x1="${margin.left}" y1="${y(value)}" x2="${width - margin.right}" y2="${y(value)}" class="grid" />
    <text x="${margin.left - 14}" y="${y(value) + 5}" text-anchor="end" class="tick">${Math.round(value / 1000)} kB</text>`,
    )
    .join("");
  const xTicks = xTickValues
    .map(
      (value) => `
    <line x1="${x(value)}" y1="${margin.top + plotHeight}" x2="${x(value)}" y2="${margin.top + plotHeight + 7}" class="axis" />
    <text x="${x(value)}" y="${margin.top + plotHeight + 27}" text-anchor="middle" class="tick">${escapeXml(value)}</text>`,
    )
    .join("");
  const plots = series
    .map((item) => {
      const itemXValues = item.xValues ?? xValues;
      const points = item.values
        .map((value, index) => `${x(itemXValues[index])},${y(value)}`)
        .join(" ");
      const markers = item.values
        .map(
          (value, index) =>
            `<circle cx="${x(itemXValues[index])}" cy="${y(value)}" r="5" fill="${colors[item.id]}" />`,
        )
        .join("");
      return `<polyline points="${points}" fill="none" stroke="${colors[item.id]}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round" />${markers}`;
    })
    .join("");
  const markers = verticalMarkers
    .map((marker) => {
      const labelOnRight = marker.labelSide === "right";
      const labelClass = marker.emphasis
        ? "annotation annotation-emphasis"
        : "annotation";
      return `
    <line x1="${x(marker.value)}" y1="${margin.top}" x2="${x(marker.value)}" y2="${margin.top + plotHeight}" class="marker" />
    <text x="${x(marker.value) + (labelOnRight ? 9 : -9)}" y="${margin.top + (marker.labelOffsetY ?? 18)}" text-anchor="${labelOnRight ? "start" : "end"}" class="${labelClass}">${escapeXml(marker.label)}</text>`;
    })
    .join("");
  const legend = series
    .map(
      (item, index) => `
    <line x1="${width - 220}" y1="${30 + index * 25}" x2="${width - 184}" y2="${30 + index * 25}" stroke="${colors[item.id]}" stroke-width="4" />
    <text x="${width - 174}" y="${35 + index * 25}" class="legend">${escapeXml(item.label)}</text>`,
    )
    .join("");
  const calloutMarkup =
    callout === null
      ? ""
      : `
  <g transform="translate(${callout.x} ${callout.y})">
    <rect width="${callout.width}" height="${callout.height}" rx="8" class="callout-box" />
    <g transform="translate(6 9) scale(0.1171875)" class="callout-icon">
      <path d="M236.8,188.09,149.35,36.22h0a24.76,24.76,0,0,0-42.7,0L19.2,188.09a23.51,23.51,0,0,0,0,23.72A24.35,24.35,0,0,0,40.55,224h174.9a24.35,24.35,0,0,0,21.33-12.19A23.51,23.51,0,0,0,236.8,188.09ZM120,104a8,8,0,0,1,16,0v40a8,8,0,0,1-16,0Zm8,88a12,12,0,1,1,12-12A12,12,0,0,1,128,192Z" />
    </g>
    <text x="40" y="25" class="callout-title">${escapeXml(callout.title)}</text>
    ${callout.lines
      .map(
        (line, index) =>
          `<text x="40" y="${47 + index * 17}" class="callout-text">${escapeXml(line)}</text>`,
      )
      .join("")}
  </g>`;
  const evidenceKeyMarkup =
    evidenceKey === null
      ? ""
      : `
  <g transform="translate(${evidenceKey.x} ${evidenceKey.y})">
    <rect width="${evidenceKey.width}" height="${evidenceKey.height}" rx="8" class="evidence-box" />
    <circle cx="15" cy="17" r="4.5" class="evidence-dot" />
    <text x="29" y="21" class="evidence-title">${escapeXml(evidenceKey.title)}</text>
    <text x="29" y="39" class="evidence-text">${escapeXml(evidenceKey.detail)}</text>
    <line x1="11" y1="55" x2="21" y2="55" class="evidence-line" />
    <text x="29" y="59" class="evidence-text">${escapeXml(evidenceKey.lineMeaning)}</text>
  </g>`;
  const evidenceKeyStyles =
    evidenceKey === null
      ? ""
      : `
    .evidence-box { fill: #ffffff; stroke: #cbd3da; stroke-width: 1.25; }
    .evidence-dot { fill: #4a5560; }
    .evidence-line { stroke: #4a5560; stroke-width: 3; stroke-linecap: round; }
    .evidence-title { fill: #2d3740; font-size: 12.5px; font-weight: 725; }
    .evidence-text { fill: #4a5560; font-size: 11.5px; }`;
  const emptyAnnotationSpacer =
    evidenceKey === null && callout === null ? "\n" : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title description">
  <title id="title">${escapeXml(title)}</title>
  <desc id="description">${escapeXml(description)}</desc>
  <style>
    text { font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; fill: #17202a; }
    .title { font-size: 23px; font-weight: 700; }
    .axis { stroke: #44515e; stroke-width: 1.5; }
    .grid { stroke: #dce2e7; stroke-width: 1; }
    .tick { font-size: 13px; }
    .label { font-size: 15px; font-weight: 600; }
    .legend { font-size: 14px; font-weight: 650; }
    .marker { stroke: #687481; stroke-width: 1.5; stroke-dasharray: 7 6; }
    .annotation { font-size: 13px; font-weight: 650; fill: #4a5560; }
    .annotation-emphasis { font-size: 16px; font-weight: 725; }
    .callout-box { fill: #fff8e6; stroke: #d69e2e; stroke-width: 1.5; }
    .callout-icon { fill: #b7791f; }
    .callout-title { fill: #644b11; font-size: 13px; font-weight: 750; }
    .callout-text { fill: #644b11; font-size: 12px; }${evidenceKeyStyles}
  </style>
  <rect width="${width}" height="${height}" fill="#ffffff" />
  <text x="${margin.left}" y="38" class="title">${escapeXml(title)}</text>
  ${legend}
  ${grid}
  <line x1="${margin.left}" y1="${margin.top}" x2="${margin.left}" y2="${margin.top + plotHeight}" class="axis" />
  <line x1="${margin.left}" y1="${margin.top + plotHeight}" x2="${width - margin.right}" y2="${margin.top + plotHeight}" class="axis" />
  ${xTicks}
  ${markers}
  ${plots}${evidenceKeyMarkup}${calloutMarkup}${emptyAnnotationSpacer}
  <text x="${margin.left + plotWidth / 2}" y="${height - 20}" text-anchor="middle" class="label">${escapeXml(xLabel)}</text>
  <text x="22" y="${margin.top + plotHeight / 2}" text-anchor="middle" transform="rotate(-90 22 ${margin.top + plotHeight / 2})" class="label">${escapeXml(yLabel)}</text>
</svg>
`.replace(/^[ \t]+$/gm, "");
}

const routeSplit = JSON.parse(
  fs.readFileSync(path.join(root, "route-split.json"), "utf8"),
);
const componentCounts = routeSplit.metadata.componentCounts;
const vueSourceLines = componentCounts.map(
  (count) =>
    routeSplit.results.find(
      (item) => item.framework === "vue" && item.count === count,
    ).source.nonblankLines,
);
const svelteSourceLines = componentCounts.map(
  (count) =>
    routeSplit.results.find(
      (item) => item.framework === "svelte" && item.count === count,
    ).source.nonblankLines,
);
const routePlotIndexes = [4, 5, 6, 7];
const routeSeries = ["vue", "svelte"].map((framework) => ({
  id: framework,
  label: framework === "vue" ? "Vue 3.5" : "Svelte 5",
  xValues: routePlotIndexes.map((index) =>
    framework === "vue" ? vueSourceLines[index] : svelteSourceLines[index],
  ),
  values: routePlotIndexes.map(
    (index) =>
      routeSplit.results.find(
        (item) =>
          item.framework === framework &&
          item.count === componentCounts[index],
      ).chunked.brotli,
  ),
}));
const routeBrotliCrossoverLines = piecewiseCrossover(
  routeSeries.find((item) => item.id === "vue"),
  routeSeries.find((item) => item.id === "svelte"),
);
const formatLines = (value) =>
  value >= 1000 ? `${(value / 1000).toFixed(1)}k` : String(value);
fs.writeFileSync(
  path.join(outputDir, "route-split-brotli.svg"),
  lineChart({
    title: "Vue eventually becomes smaller than Svelte",
    description:
      "Total JavaScript transferred after visiting every route, with each response compressed independently using Brotli. Every dot is a separately measured production build at 64, 128, 256, or 512 matched feature definitions; the lines interpolate between those measurements. Vue's transferred JavaScript grows more slowly, so the measured gap closes and reverses by the largest build. Only the precise crossover location is estimated.",
    xLabel: "Nonblank source lines",
    yLabel: "JavaScript transferred after all routes (Brotli)",
    xValues: [0, 2000, 4000, 6000, 8000, 10_000],
    series: routeSeries,
    verticalMarkers:
      routeBrotliCrossoverLines === null
        ? []
        : [
            {
              value: routeBrotliCrossoverLines,
              label: `Crossover near ${formatLines(routeBrotliCrossoverLines)} lines`,
              labelSide: "right",
              labelOffsetY: 105,
              emphasis: true,
            },
          ],
    callout: {
      x: 450,
      y: 292,
      width: 367,
      height: 94,
      title: "This is an estimate, not a rule!",
      lines: [
        "This demonstrates Vue’s amortization principle;",
        "application structure, chunking, and compression vary.",
        "The principle is proven; the exact threshold is not.",
      ],
    },
    evidenceKey: {
      x: 110,
      y: 83,
      width: 322,
      height: 70,
      title: "Dots = separately measured production builds",
      detail: "Left → right: 64, 128, 256, 512 matched definitions",
      lineMeaning: "Lines connect measurements; the crossing is estimated",
    },
  }),
);

const handAuthored = JSON.parse(
  fs.readFileSync(path.join(root, "hand-authored.json"), "utf8"),
);
const definitionCounts = handAuthored.metadata.routeCounts.map(
  (routes) =>
    handAuthored.results.find(
      (item) => item.framework === "vue" && item.routes === routes,
    ).componentDefinitions,
);
const handSeries = ["vue", "svelte"].map((framework) => ({
  id: framework,
  label: framework === "vue" ? "Vue 3.5" : "Svelte 5",
  values: handAuthored.metadata.routeCounts.map(
    (routes) =>
      handAuthored.results.find(
        (item) => item.framework === framework && item.routes === routes,
      ).complete.brotli,
  ),
}));
fs.writeFileSync(
  path.join(outputDir, "hand-authored-brotli.svg"),
  lineChart({
    title: "Small 8-route application: Svelte remains smaller",
    description:
      "Total JavaScript transferred after visiting every route in the small product-shaped application. Svelte remains smaller through all 33 component definitions, while the gap narrows.",
    xLabel: "Component definitions across lazy-loaded routes",
    yLabel: "JavaScript transferred after all routes (Brotli)",
    xValues: definitionCounts,
    series: handSeries,
  }),
);

console.log("Generated 2 deterministic SVG charts");
