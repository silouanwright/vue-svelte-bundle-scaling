<script>
  import ForecastItem from "./ForecastItem.svelte";

  let { forecast, unit } = $props();
</script>

<section class="forecast-card" data-testid="forecast">
  <p class="muted">Daily outlook</p>
  <h2>Seven-day forecast</h2>
  <ol class="forecast-list">
    {#each forecast as day, index (day.date)}
      <ForecastItem {day} {index} {unit} />
    {/each}
  </ol>
</section>
