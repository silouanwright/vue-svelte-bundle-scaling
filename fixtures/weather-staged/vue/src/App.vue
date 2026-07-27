<script setup>
import { computed, nextTick, ref } from "vue";

import { locations, weatherByLocation } from "@shared/weather-data.js";
import {
  findLocations,
  locationLabel,
  weatherSummary,
} from "@shared/weather-model.js";
import CurrentWeather from "./components/CurrentWeather.vue";
import ForecastList from "./components/ForecastList.vue";
import SearchForm from "./components/SearchForm.vue";
import StatusMessage from "./components/StatusMessage.vue";

const selectedId = ref("chicago");
const query = ref("");
const unit = ref("celsius");
const loading = ref(false);
const error = ref("");

const selectedWeather = computed(() => weatherByLocation[selectedId.value]);
const matches = computed(() => findLocations(locations, query.value));
const summary = computed(() =>
  weatherSummary(selectedWeather.value, unit.value),
);

async function selectLocation(location) {
  loading.value = true;
  error.value = "";
  query.value = locationLabel(location);
  await nextTick();
  selectedId.value = location.id;
  loading.value = false;
}
</script>

<template>
  <div class="app-shell">
    <header class="app-header">
      <div>
        <p class="muted">Normalized Vue 3 / Svelte 5 fixture</p>
        <h1>Weather Workspace</h1>
      </div>
      <div class="header-actions">
        <SearchForm
          v-model="query"
          :matches="matches"
          @select="selectLocation"
        />
        <div class="unit-switch" aria-label="Temperature unit">
          <button
            type="button"
            :aria-pressed="unit === 'celsius'"
            @click="unit = 'celsius'"
          >
            °C
          </button>
          <button
            type="button"
            :aria-pressed="unit === 'fahrenheit'"
            @click="unit = 'fahrenheit'"
          >
            °F
          </button>
        </div>
      </div>
    </header>

    <StatusMessage v-if="loading" kind="loading" message="Loading weather…" />
    <StatusMessage v-else-if="error" kind="error" :message="error" />
    <main v-else class="content-grid" :aria-label="summary">
      <CurrentWeather :weather="selectedWeather" :unit="unit" />
      <ForecastList :forecast="selectedWeather.forecast" :unit="unit" />
    </main>
  </div>
</template>
