<script setup>
import ForecastItem from "./ForecastItem.vue";

defineProps({
  forecast: { type: Array, required: true },
  unit: { type: String, required: true },
});
</script>

<template>
  <section class="forecast-card" data-testid="forecast">
    <p class="muted">Daily outlook</p>
    <h2>Seven-day forecast</h2>
    <ol class="forecast-list">
      <ForecastItem
        v-for="(day, index) in forecast"
        :key="day.date"
        :day="day"
        :index="index"
        :unit="unit"
      />
    </ol>
  </section>
</template>
