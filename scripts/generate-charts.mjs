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

function lineChart({
  title,
  description,
  xLabel,
  yLabel,
  xValues,
  xTickValues = xValues,
  series,
}) {
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  const maxX = Math.max(...xValues);
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
    <text x="${x(value)}" y="${margin.top + plotHeight + 27}" text-anchor="middle" class="tick">${value}</text>`,
    )
    .join("");
  const plots = series
    .map((item) => {
      const points = item.values
        .map((value, index) => `${x(xValues[index])},${y(value)}`)
        .join(" ");
      const markers = item.values
        .map(
          (value, index) =>
            `<circle cx="${x(xValues[index])}" cy="${y(value)}" r="5" fill="${colors[item.id]}" />`,
        )
        .join("");
      return `<polyline points="${points}" fill="none" stroke="${colors[item.id]}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round" />${markers}`;
    })
    .join("");
  const legend = series
    .map(
      (item, index) => `
    <line x1="${width - 220}" y1="${30 + index * 25}" x2="${width - 184}" y2="${30 + index * 25}" stroke="${colors[item.id]}" stroke-width="4" />
    <text x="${width - 174}" y="${35 + index * 25}" class="legend">${escapeXml(item.label)}</text>`,
    )
    .join("");

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
  </style>
  <rect width="${width}" height="${height}" fill="#ffffff" />
  <text x="${margin.left}" y="38" class="title">${escapeXml(title)}</text>
  ${legend}
  ${grid}
  <line x1="${margin.left}" y1="${margin.top}" x2="${margin.left}" y2="${margin.top + plotHeight}" class="axis" />
  <line x1="${margin.left}" y1="${margin.top + plotHeight}" x2="${width - margin.right}" y2="${margin.top + plotHeight}" class="axis" />
  ${xTicks}
  ${plots}
  <text x="${margin.left + plotWidth / 2}" y="${height - 20}" text-anchor="middle" class="label">${escapeXml(xLabel)}</text>
  <text x="22" y="${margin.top + plotHeight / 2}" text-anchor="middle" transform="rotate(-90 22 ${margin.top + plotHeight / 2})" class="label">${escapeXml(yLabel)}</text>
</svg>
`.replace(/^[ \t]+$/gm, "");
}

const routeSplit = JSON.parse(
  fs.readFileSync(path.join(root, "route-split.json"), "utf8"),
);
const routeCounts = routeSplit.metadata.componentCounts;
const routeSeries = ["vue", "svelte"].map((framework) => ({
  id: framework,
  label: framework === "vue" ? "Vue 3.5" : "Svelte 5",
  values: routeCounts.map(
    (count) =>
      routeSplit.results.find(
        (item) => item.framework === framework && item.count === count,
      ).chunked.brotli,
  ),
}));
fs.writeFileSync(
  path.join(outputDir, "route-split-brotli.svg"),
  lineChart({
    title: "Heterogeneous lazy-route transfer",
    description:
      "Brotli bytes summed after independently compressing each JavaScript response. Vue becomes smaller between 256 and 512 generated components in this workload.",
    xLabel: "Distinct generated component definitions",
    yLabel: "Complete Brotli transfer",
    xValues: routeCounts,
    xTickValues: [0, 64, 128, 256, 512],
    series: routeSeries,
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
    title: "Hand-authored application transfer",
    description:
      "Complete cold-traversal Brotli bytes for one, two, four, and eight product routes. Svelte remains smaller through all 33 component definitions, while the gap narrows.",
    xLabel: "Hand-authored component definitions",
    yLabel: "Complete Brotli transfer",
    xValues: definitionCounts,
    series: handSeries,
  }),
);

console.log("Generated 2 deterministic SVG charts");
