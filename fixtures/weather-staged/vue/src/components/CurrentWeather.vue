<script setup>
import { computed } from "vue";

import {
  locationLabel,
  temperatureLabel,
} from "@shared/weather-model.js";

const props = defineProps({
  weather: { type: Object, required: true },
  unit: { type: String, required: true },
});

const temperature = computed(() =>
  temperatureLabel(props.weather.temperatureCelsius, props.unit),
);
const feelsLike = computed(() =>
  temperatureLabel(props.weather.feelsLikeCelsius, props.unit),
);
</script>

<template>
  <section class="weather-card" data-testid="current-weather">
    <p class="muted">{{ weather.location.country }}</p>
    <h2>{{ locationLabel(weather.location) }}</h2>
    <div class="current-reading">
      <span class="condition-icon" aria-hidden="true">
        {{ weather.condition.icon }}
      </span>
      <div>
        <p class="temperature">{{ temperature }}</p>
        <p class="condition-label">{{ weather.condition.label }}</p>
      </div>
    </div>
    <dl class="metrics">
      <div><dt>Feels like</dt><dd>{{ feelsLike }}</dd></div>
      <div><dt>Humidity</dt><dd>{{ weather.humidity }}%</dd></div>
      <div><dt>Wind</dt><dd>{{ weather.windKph }} km/h {{ weather.windDirection }}</dd></div>
      <div><dt>Visibility</dt><dd>{{ weather.visibilityKm }} km</dd></div>
      <div><dt>Pressure</dt><dd>{{ weather.pressureHpa }} hPa</dd></div>
      <div><dt>Sun</dt><dd>{{ weather.sunrise }}–{{ weather.sunset }}</dd></div>
    </dl>
  </section>
</template>
