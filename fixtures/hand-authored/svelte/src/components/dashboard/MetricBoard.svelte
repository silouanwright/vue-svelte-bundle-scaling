<script>
  let period = $state("week");
  const metrics = [
    { label: "Documents", week: 184, month: 712 },
    { label: "Annotations", week: 63, month: 241 },
    { label: "Exports", week: 12, month: 38 },
  ];
  let visible = $derived(metrics.map((metric) => ({ label: metric.label, value: metric[period] })));
  let total = $derived(visible.reduce((sum, metric) => sum + metric.value, 0));
</script>

<article class="panel stack">
  <div class="inline">
    <h3>Throughput</h3>
    <select bind:value={period} aria-label="Metric period" data-testid="metric-period">
      <option value="week">This week</option>
      <option value="month">This month</option>
    </select>
  </div>
  <dl>
    {#each visible as metric (metric.label)}
      <dt>{metric.label}</dt>
      <dd class="metric">{metric.value}</dd>
    {/each}
  </dl>
  <output data-testid="metric-total">Total {total}</output>
</article>
