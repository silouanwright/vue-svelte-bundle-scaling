<script setup>
import { computed, ref } from "vue";

const period = ref("week");
const metrics = [
  { label: "Documents", week: 184, month: 712 },
  { label: "Annotations", week: 63, month: 241 },
  { label: "Exports", week: 12, month: 38 },
];
const visible = computed(() =>
  metrics.map((metric) => ({ label: metric.label, value: metric[period.value] })),
);
const total = computed(() => visible.value.reduce((sum, metric) => sum + metric.value, 0));
</script>

<template>
  <article class="panel stack">
    <div class="inline">
      <h3>Throughput</h3>
      <select v-model="period" aria-label="Metric period" data-testid="metric-period">
        <option value="week">This week</option>
        <option value="month">This month</option>
      </select>
    </div>
    <dl>
      <template v-for="metric in visible" :key="metric.label">
        <dt>{{ metric.label }}</dt>
        <dd class="metric">{{ metric.value }}</dd>
      </template>
    </dl>
    <output data-testid="metric-total">Total {{ total }}</output>
  </article>
</template>
