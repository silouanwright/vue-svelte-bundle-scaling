<script setup>
import { searchRecords } from "@shared/catalog.js";
import { computed } from "vue";

const props = defineProps({
  query: { type: String, required: true },
  selectedTypes: { type: Array, required: true },
});
const matches = computed(() => {
  const needle = props.query.trim().toLowerCase();
  return searchRecords
    .filter((record) => !needle || record.title.toLowerCase().includes(needle))
    .filter((record) => !props.selectedTypes.length || props.selectedTypes.includes(record.type))
    .toSorted((left, right) => right.score - left.score);
});
</script>

<template>
  <section class="panel stack">
    <h3>{{ matches.length }} results</h3>
    <article v-for="record in matches" :key="record.id">
      <p><strong>{{ record.title }}</strong> <span class="muted">{{ record.type }}</span></p>
      <progress :value="record.score" max="1">{{ record.score }}</progress>
    </article>
    <p v-if="!matches.length" data-testid="empty-results">No matching records</p>
  </section>
</template>
