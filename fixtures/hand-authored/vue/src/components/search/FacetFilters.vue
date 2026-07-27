<script setup>
const selected = defineModel({ type: Array, required: true });
const facets = [
  { value: "Document", label: "Documents", count: 2 },
  { value: "Note", label: "Notes", count: 1 },
  { value: "Checklist", label: "Checklists", count: 1 },
];
</script>

<template>
  <aside class="panel stack">
    <h3>Type filters</h3>
    <label v-for="facet in facets" :key="facet.value" class="inline">
      <input v-model="selected" type="checkbox" :value="facet.value" />
      {{ facet.label }} <span class="muted">{{ facet.count }}</span>
    </label>
    <button v-if="selected.length" @click="selected = []">Clear filters</button>
  </aside>
</template>
