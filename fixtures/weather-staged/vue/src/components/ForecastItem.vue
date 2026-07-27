<script setup>
import { computed } from "vue";

import {
  formatDay,
  temperatureLabel,
} from "@shared/weather-model.js";

const props = defineProps({
  day: { type: Object, required: true },
  index: { type: Number, required: true },
  unit: { type: String, required: true },
});

const label = computed(() => formatDay(props.day.date, props.index));
const high = computed(() =>
  temperatureLabel(props.day.highCelsius, props.unit),
);
const low = computed(() =>
  temperatureLabel(props.day.lowCelsius, props.unit),
);
</script>

<template>
  <li class="forecast-item">
    <strong>{{ label }}</strong>
    <span aria-hidden="true">{{ day.condition.icon }}</span>
    <span>
      {{ day.condition.label }}
      <small class="muted">{{ day.precipitation }}% rain</small>
    </span>
    <span class="forecast-temperatures">
      <strong>{{ high }}</strong><span class="muted">{{ low }}</span>
    </span>
  </li>
</template>
