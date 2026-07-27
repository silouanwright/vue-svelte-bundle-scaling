<script>
  import {
    locationLabel,
    temperatureLabel,
  } from "@shared/weather-model.js";

  let { weather, unit } = $props();
  let temperature = $derived(temperatureLabel(weather.temperatureCelsius, unit));
  let feelsLike = $derived(temperatureLabel(weather.feelsLikeCelsius, unit));
</script>

<section class="weather-card" data-testid="current-weather">
  <p class="muted">{weather.location.country}</p>
  <h2>{locationLabel(weather.location)}</h2>
  <div class="current-reading">
    <span class="condition-icon" aria-hidden="true">
      {weather.condition.icon}
    </span>
    <div>
      <p class="temperature">{temperature}</p>
      <p class="condition-label">{weather.condition.label}</p>
    </div>
  </div>
  <dl class="metrics">
    <div><dt>Feels like</dt><dd>{feelsLike}</dd></div>
    <div><dt>Humidity</dt><dd>{weather.humidity}%</dd></div>
    <div><dt>Wind</dt><dd>{weather.windKph} km/h {weather.windDirection}</dd></div>
    <div><dt>Visibility</dt><dd>{weather.visibilityKm} km</dd></div>
    <div><dt>Pressure</dt><dd>{weather.pressureHpa} hPa</dd></div>
    <div><dt>Sun</dt><dd>{weather.sunrise}–{weather.sunset}</dd></div>
  </dl>
</section>
