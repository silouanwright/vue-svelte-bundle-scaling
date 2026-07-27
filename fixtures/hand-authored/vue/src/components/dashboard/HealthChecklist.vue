<script setup>
import { computed, ref } from "vue";

const checks = ref([
  { id: "index", label: "Search index current", done: true },
  { id: "backup", label: "Backup verified", done: true },
  { id: "review", label: "Review queue empty", done: false },
  { id: "exports", label: "Exports archived", done: false },
]);
const completed = computed(() => checks.value.filter((check) => check.done).length);
const percent = computed(() => Math.round((completed.value / checks.value.length) * 100));
</script>

<template>
  <article class="panel stack">
    <h3>Workspace health</h3>
    <progress :value="completed" :max="checks.length">{{ percent }}%</progress>
    <label v-for="check in checks" :key="check.id" class="inline">
      <input v-model="check.done" type="checkbox" />
      {{ check.label }}
    </label>
    <output data-testid="health-progress">{{ completed }}/{{ checks.length }} complete</output>
  </article>
</template>
