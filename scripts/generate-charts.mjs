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
  showPointMarkers = true,
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
      const markers = showPointMarkers
        ? item.values
            .map(
              (value, index) =>
                `<circle cx="${x(itemXValues[index])}" cy="${y(value)}" r="5" fill="${colors[item.id]}" />`,
            )
            .join("")
        : "";
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
  const emptyAnnotationSpacer = callout === null ? "\n" : "";

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
    .callout-text { fill: #644b11; font-size: 12px; }
  </style>
  <rect width="${width}" height="${height}" fill="#ffffff" />
  <text x="${margin.left}" y="38" class="title">${escapeXml(title)}</text>
  ${legend}
  ${grid}
  <line x1="${margin.left}" y1="${margin.top}" x2="${margin.left}" y2="${margin.top + plotHeight}" class="axis" />
  <line x1="${margin.left}" y1="${margin.top + plotHeight}" x2="${width - margin.right}" y2="${margin.top + plotHeight}" class="axis" />
  ${xTicks}
  ${markers}
  ${plots}${calloutMarkup}${emptyAnnotationSpacer}
  <text x="${margin.left + plotWidth / 2}" y="${height - 20}" text-anchor="middle" class="label">${escapeXml(xLabel)}</text>
  <text x="22" y="${margin.top + plotHeight / 2}" text-anchor="middle" transform="rotate(-90 22 ${margin.top + plotHeight / 2})" class="label">${escapeXml(yLabel)}</text>
</svg>
`.replace(/^[ \t]+$/gm, "");
}

function groupedBarPanel({
  x: panelX,
  y: panelY,
  width: panelWidth,
  height: panelHeight,
  title,
  note,
  categories,
  maximum,
  ticks,
  barWidth: requestedBarWidth,
}) {
  const chartTop = panelY + 52;
  const chartBottom = panelY + panelHeight - 52;
  const chartHeight = chartBottom - chartTop;
  const y = (value) =>
    Number((chartBottom - (value / maximum) * chartHeight).toFixed(2));
  const groupWidth = panelWidth / categories.length;
  const barWidth =
    requestedBarWidth ?? Math.min(34, groupWidth * 0.26);

  const grid = ticks
    .map(
      (value) => `
    <line x1="${panelX}" y1="${y(value)}" x2="${panelX + panelWidth}" y2="${y(value)}" class="grid" />
    <text x="${panelX - 10}" y="${y(value) + 5}" text-anchor="end" class="tick">${escapeXml(value === 0 ? "0" : `${value / 1000} kB`)}</text>`,
    )
    .join("");

  const bars = categories
    .map((category, index) => {
      const center = panelX + groupWidth * (index + 0.5);
      const frameworkBars = ["vue", "svelte"]
        .map((framework, frameworkIndex) => {
          const value = category[framework];
          const barX =
            center +
            (frameworkIndex === 0 ? -barWidth - 3 : 3);
          const barY = y(value);
          return `
    <rect x="${barX}" y="${barY}" width="${barWidth}" height="${chartBottom - barY}" rx="3" fill="${colors[framework]}" />
    <text x="${barX + barWidth / 2}" y="${barY - 8}" text-anchor="middle" class="value">${(value / 1000).toFixed(value < 2000 ? 2 : 1)} kB</text>`;
        })
        .join("");
      return `${frameworkBars}
    <text x="${center}" y="${chartBottom + 23}" text-anchor="middle" class="category">${escapeXml(category.label)}</text>`;
    })
    .join("");

  return `
  <text x="${panelX}" y="${panelY + 4}" class="panel-title">${escapeXml(title)}</text>
  <text x="${panelX}" y="${panelY + 25}" class="panel-note">${escapeXml(note)}</text>
  ${grid}
  <line x1="${panelX}" y1="${chartTop}" x2="${panelX}" y2="${chartBottom}" class="axis" />
  <line x1="${panelX}" y1="${chartBottom}" x2="${panelX + panelWidth}" y2="${chartBottom}" class="axis" />
  ${bars}`;
}

function smallLargeComparisonChart(results) {
  const result = (framework, count) =>
    results.find(
      (item) => item.framework === framework && item.count === count,
    ).chunked.brotli;
  const smallPanel = groupedBarPanel({
    x: 76,
    y: 116,
    width: 350,
    height: 340,
    title: "1 route",
    note: "8 component definitions",
    maximum: 25_000,
    ticks: [0, 5_000, 10_000, 15_000, 20_000, 25_000],
    barWidth: 56,
    categories: [
      {
        label: "Svelte smaller by 6.5 kB",
        vue: result("vue", 8),
        svelte: result("svelte", 8),
      },
    ],
  });
  const largePanel = groupedBarPanel({
    x: 520,
    y: 116,
    width: 310,
    height: 340,
    title: "64 routes",
    note: "512 component definitions",
    maximum: 130_000,
    ticks: [0, 40_000, 80_000, 120_000],
    barWidth: 56,
    categories: [
      {
        label: "Vue smaller by 7.3 kB",
        vue: result("vue", 512),
        svelte: result("svelte", 512),
      },
    ],
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title description">
  <title id="title">Route-split application simulation at two measured sizes</title>
  <desc id="description">Complete production bundles from the generated route-split application simulation. Svelte is smaller at eight component definitions. Vue is smaller at 512 component definitions after its larger shared runtime is amortized.</desc>
  <style>
    text { font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; fill: #17202a; }
    .title { font-size: 23px; font-weight: 700; }
    .subtitle { font-size: 14px; fill: #4a5560; }
    .panel-title { font-size: 16px; font-weight: 700; }
    .panel-note { font-size: 12px; fill: #4a5560; }
    .axis { stroke: #44515e; stroke-width: 1.5; }
    .grid { stroke: #dce2e7; stroke-width: 1; }
    .tick { font-size: 12px; }
    .category { font-size: 13px; font-weight: 600; }
    .value { font-size: 11px; font-weight: 650; }
    .legend { font-size: 14px; font-weight: 650; }
  </style>
  <rect width="${width}" height="${height}" fill="#ffffff" />
  <text x="42" y="62" class="title">Route-split application simulation at two measured sizes</text>
  <text x="42" y="86" class="subtitle">Composition-only profile · complete production transfer</text>
  <rect x="650" y="27" width="15" height="15" rx="2" fill="${colors.vue}" />
  <text x="674" y="40" class="legend">Vue 3.5</text>
  <rect x="760" y="27" width="15" height="15" rx="2" fill="${colors.svelte}" />
  <text x="784" y="40" class="legend">Svelte 5</text>
  ${smallPanel}
  ${largePanel}
  <text x="440" y="478" text-anchor="middle" class="subtitle">Brotli after visiting every included route · each panel uses its own y-axis</text>
</svg>
`.replace(/^[ \t]+$/gm, "");
}

function realApplicationsChart(
  weatherResults,
  terminalResults,
  openslidesResults,
  {
    sizeKey,
    maximum,
    ticks,
    title,
    subtitle,
    description,
  },
) {
  const weather = Object.fromEntries(
    weatherResults.map((result) => [
      result.framework,
      result.complete[sizeKey],
    ]),
  );
  const terminal = Object.fromEntries(
    terminalResults.map((result) => [result.framework, result[sizeKey]]),
  );
  const openslides = Object.fromEntries(
    openslidesResults.map((result) => [result.framework, result]),
  );
  const stages = [
    {
      label: "Small app",
      detail: "Weather Front",
      condition: "Entire app",
      vue: weather.vue,
      svelte: weather.svelte,
    },
    {
      label: "Small app",
      detail: "Terminal",
      condition: "Entire app",
      vue: terminal.vue,
      svelte: terminal.svelte,
    },
    {
      label: "Medium-size app",
      detail: "OpenSlides · one route",
      condition: "Dashboard",
      vue: openslides.vue.journey.dashboard[sizeKey],
      svelte: openslides.svelte.journey.dashboard[sizeKey],
    },
    {
      label: "Medium-size app",
      detail: "OpenSlides · two routes",
      condition: "Dashboard + editor",
      vue: openslides.vue.journey.editor[sizeKey],
      svelte: openslides.svelte.journey.editor[sizeKey],
    },
  ];
  const chart = {
    left: 92,
    right: 830,
    top: 88,
    bottom: 390,
    maximum,
  };
  const stageX = [138, 326, 526, 748];
  const y = (value) =>
    Number(
      (
        chart.bottom -
        (value / chart.maximum) * (chart.bottom - chart.top)
      ).toFixed(2),
    );
  const segment = (framework, index) => {
    const previousIndex = Math.max(0, index - 1);
    const nextIndex = index + 1;
    const followingIndex = Math.min(stages.length - 1, index + 2);
    const start = {
      x: stageX[index],
      y: y(stages[index][framework]),
    };
    const end = {
      x: stageX[nextIndex],
      y: y(stages[nextIndex][framework]),
    };
    const previous = {
      x: stageX[previousIndex],
      y: y(stages[previousIndex][framework]),
    };
    const following = {
      x: stageX[followingIndex],
      y: y(stages[followingIndex][framework]),
    };
    return {
      start,
      control1: {
        x: start.x + (end.x - previous.x) / 6,
        y: start.y + (end.y - previous.y) / 6,
      },
      control2: {
        x: end.x - (following.x - start.x) / 6,
        y: end.y - (following.y - start.y) / 6,
      },
      end,
    };
  };
  const crossoverStart = stageX[1];
  const crossoverEnd = stageX[2];
  const crossoverMidpoint = (crossoverStart + crossoverEnd) / 2;
  const grid = ticks
    .map(
      (value) => `
  <line x1="${chart.left}" y1="${y(value)}" x2="${chart.right}" y2="${y(value)}" class="grid" />
  <text x="${chart.left - 14}" y="${y(value) + 5}" text-anchor="end" class="tick">${(value / 1000).toLocaleString("en-US")} kB</text>`,
    )
    .join("");
  const plots = ["vue", "svelte"]
    .map((framework) => {
      const color = colors[framework];
      const path = stages
        .slice(0, -1)
        .map((_, index) => {
          const curve = segment(framework, index);
          return `C ${curve.control1.x.toFixed(2)} ${curve.control1.y.toFixed(2)}, ${curve.control2.x.toFixed(2)} ${curve.control2.y.toFixed(2)}, ${curve.end.x} ${curve.end.y}`;
        })
        .join(" ");
      const circles = stages
        .map(
          (stage, index) =>
            framework === "vue"
              ? `<circle cx="${stageX[index]}" cy="${y(stage[framework])}" r="6" fill="${color}" />`
              : `<rect x="${stageX[index] - 5}" y="${y(stage[framework]) - 5}" width="10" height="10" rx="1" fill="${color}" transform="rotate(45 ${stageX[index]} ${y(stage[framework])})" />`,
        )
        .join("");
      return `
  <path d="M ${stageX[0]} ${y(stages[0][framework])} ${path}" fill="none" stroke="${color}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
  ${circles}`;
    })
    .join("");
  const stageLabels = stages
    .map(
      (stage, index) => `
  <text x="${stageX[index]}" y="417" text-anchor="middle" class="label">${stage.label}</text>
  <text x="${stageX[index]}" y="437" text-anchor="middle" class="detail">${stage.detail}</text>
  <text x="${stageX[index]}" y="455" text-anchor="middle" class="detail">${stage.condition}</text>`,
    )
    .join("");
  const formatSize = (value) =>
    `${Math.floor(value / 1000).toLocaleString("en-US")} kB`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title description">
  <title id="title">${title}</title>
  <desc id="description">${description}</desc>
  <style>
    text { font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; fill: #17202a; }
    .title { font-size: 23px; font-weight: 700; }
    .subtitle { font-size: 13px; fill: #4a5560; }
    .axis { stroke: #44515e; stroke-width: 1.5; }
    .grid { stroke: #dce2e7; stroke-width: 1; }
    .tick { font-size: 12px; }
    .label { font-size: 14px; font-weight: 650; }
    .detail { font-size: 12px; fill: #4a5560; }
    .value { font-size: 12px; font-weight: 700; }
    .legend { font-size: 14px; font-weight: 650; }
    .crossover { font-size: 12px; font-weight: 700; fill: #4a5560; }
  </style>
  <rect width="${width}" height="${height}" fill="#ffffff" />
  <text x="42" y="38" class="title">${title}</text>
  <text x="42" y="61" class="subtitle">${subtitle}</text>
  <line x1="672" y1="30" x2="708" y2="30" stroke="${colors.vue}" stroke-width="4" />
  <circle cx="690" cy="30" r="5" fill="${colors.vue}" />
  <text x="718" y="35" class="legend">Vue</text>
  <line x1="770" y1="30" x2="806" y2="30" stroke="${colors.svelte}" stroke-width="4" />
  <rect x="783" y="25" width="10" height="10" rx="1" fill="${colors.svelte}" transform="rotate(45 788 30)" />
  <text x="816" y="35" class="legend">Svelte</text>
  <rect x="${crossoverStart}" y="${chart.top}" width="${crossoverEnd - crossoverStart}" height="${chart.bottom - chart.top}" fill="#f2f5f7" />
  ${grid}
  <line x1="${chart.left}" y1="${chart.top}" x2="${chart.left}" y2="${chart.bottom}" class="axis" />
  <line x1="${chart.left}" y1="${chart.bottom}" x2="${chart.right}" y2="${chart.bottom}" class="axis" />
  <line x1="${crossoverStart + 14}" y1="${chart.top + 50}" x2="${crossoverEnd - 14}" y2="${chart.top + 50}" stroke="#7b8794" stroke-width="1.5" />
  <line x1="${crossoverStart + 14}" y1="${chart.top + 44}" x2="${crossoverStart + 14}" y2="${chart.top + 56}" stroke="#7b8794" stroke-width="1.5" />
  <line x1="${crossoverEnd - 14}" y1="${chart.top + 44}" x2="${crossoverEnd - 14}" y2="${chart.top + 56}" stroke="#7b8794" stroke-width="1.5" />
  <text x="${crossoverMidpoint}" y="${chart.top + 19}" text-anchor="middle" class="crossover">Possible crossover interval</text>
  <text x="${crossoverMidpoint}" y="${chart.top + 37}" text-anchor="middle" class="detail">Exact point varies by application</text>
  ${plots}
  <text x="${stageX[0] - 10}" y="${y(stages[0].svelte) - 14}" text-anchor="end" class="value">${formatSize(stages[0].svelte)}</text>
  <text x="${stageX[0] + 10}" y="${y(stages[0].vue) + 14}" class="value">${formatSize(stages[0].vue)}</text>
  <text x="${stageX[1] - 10}" y="${y(stages[1].svelte) - 12}" text-anchor="end" class="value">${formatSize(stages[1].svelte)}</text>
  <text x="${stageX[1] - 10}" y="${y(stages[1].vue) + 18}" text-anchor="end" class="value">${formatSize(stages[1].vue)}</text>
  <text x="${stageX[2] - 10}" y="${y(stages[2].svelte) - 12}" text-anchor="end" class="value">${formatSize(stages[2].svelte)}</text>
  <text x="${stageX[2] + 10}" y="${y(stages[2].vue) + 22}" class="value">${formatSize(stages[2].vue)}</text>
  <text x="${stageX[3] - 10}" y="${y(stages[3].svelte) - 12}" text-anchor="end" class="value">${formatSize(stages[3].svelte)}</text>
  <text x="${stageX[3] + 10}" y="${y(stages[3].vue) + 22}" class="value">${formatSize(stages[3].vue)}</text>
  ${stageLabels}
</svg>
`.replace(/^[ \t]+$/gm, "");
}

const routeSplit = JSON.parse(
  fs.readFileSync(path.join(root, "route-split-trimmed.json"), "utf8"),
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
    title: "Route-split application simulation",
    description:
      "Composition-only production profile. Total JavaScript transferred after visiting every route, with each response compressed independently using Brotli. Each line connects separately measured production builds at 64, 128, 256, and 512 matched feature definitions. Vue's transferred JavaScript grows more slowly, so the measured gap closes and reverses by the largest build. Only the precise crossover location is estimated.",
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
    showPointMarkers: false,
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

fs.writeFileSync(
  path.join(outputDir, "small-large-complete-bundles.svg"),
  smallLargeComparisonChart(routeSplit.results),
);

const openslides = JSON.parse(
  fs.readFileSync(path.join(root, "openslides.json"), "utf8"),
);
const weatherStaged = JSON.parse(
  fs.readFileSync(path.join(root, "weather-staged.json"), "utf8"),
);
const terminalControl = JSON.parse(
  fs.readFileSync(path.join(root, "terminal-control.json"), "utf8"),
);
fs.writeFileSync(
  path.join(outputDir, "real-applications-brotli.svg"),
  realApplicationsChart(
    weatherStaged.results,
    terminalControl.results,
    openslides.results,
    {
      sizeKey: "brotli",
      maximum: 700_000,
      ticks: [
        0,
        100_000,
        200_000,
        300_000,
        400_000,
        500_000,
        600_000,
      ],
      title: "From a small app to a medium-sized app (kB)",
      subtitle:
        "Vue versus Svelte · cumulative Brotli transfer · four measured production states",
      description:
        "Svelte is smaller for the controlled Weather Front and independently authored terminal applications. Vue is smaller after the medium-sized OpenSlides dashboard route loads and extends its lead after the editor route loads. One continuous curve passes through the four measured Brotli transfer states for each framework.",
    },
  ),
);

fs.writeFileSync(
  path.join(outputDir, "real-applications-raw.svg"),
  realApplicationsChart(
    weatherStaged.results,
    terminalControl.results,
    openslides.results,
    {
      sizeKey: "raw",
      maximum: 3_500_000,
      ticks: [
        0,
        500_000,
        1_000_000,
        1_500_000,
        2_000_000,
        2_500_000,
        3_000_000,
      ],
      title: "Production output before compression (kB)",
      subtitle:
        "Vue versus Svelte · cumulative uncompressed production bytes · four measured states",
      description:
        "Before transfer compression, Svelte emits less production output for the Weather Front and terminal applications. Vue emits less after the OpenSlides dashboard route loads and extends its lead after the editor route loads. One continuous curve passes through the four measured uncompressed production states for each framework.",
    },
  ),
);

console.log("Generated 5 deterministic SVG charts");
