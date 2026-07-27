<script setup>
import { locationLabel } from "@shared/weather-model.js";

defineProps({
  matches: { type: Array, required: true },
});

const model = defineModel({ type: String, required: true });
const emit = defineEmits(["select"]);
</script>

<template>
  <div class="search-panel">
    <div class="search-row">
      <label for="location-search">Location</label>
      <input
        id="location-search"
        v-model="model"
        type="search"
        autocomplete="off"
        placeholder="Search a city"
      />
    </div>
    <ul v-if="matches.length" class="suggestions" aria-label="Locations">
      <li v-for="location in matches" :key="location.id">
        <button type="button" @click="emit('select', location)">
          <strong>{{ locationLabel(location) }}</strong>
          <span class="muted"> — {{ location.country }}</span>
        </button>
      </li>
    </ul>
  </div>
</template>
