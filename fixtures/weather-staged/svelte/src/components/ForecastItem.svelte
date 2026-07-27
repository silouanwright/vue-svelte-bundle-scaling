<script>
  import {
    formatDay,
    temperatureLabel,
  } from "@shared/weather-model.js";

  let { day, index, unit } = $props();
  let label = $derived(formatDay(day.date, index));
  let high = $derived(temperatureLabel(day.highCelsius, unit));
  let low = $derived(temperatureLabel(day.lowCelsius, unit));
</script>

<li class="forecast-item">
  <strong>{label}</strong>
  <span aria-hidden="true">{day.condition.icon}</span>
  <span>
    {day.condition.label}
    <small class="muted">{day.precipitation}% rain</small>
  </span>
  <span class="forecast-temperatures">
    <strong>{high}</strong><span class="muted">{low}</span>
  </span>
</li>
