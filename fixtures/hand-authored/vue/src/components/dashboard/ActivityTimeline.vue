<script setup>
import { activities } from "@shared/catalog.js";
import { computed, ref } from "vue";

const selectedKind = ref("all");
const kinds = ["all", ...new Set(activities.map((activity) => activity.kind))];
const visible = computed(() =>
  selectedKind.value === "all"
    ? activities
    : activities.filter((activity) => activity.kind === selectedKind.value),
);
</script>

<template>
  <article class="panel stack">
    <h3>Recent activity</h3>
    <div class="inline" aria-label="Activity filters">
      <button
        v-for="kind in kinds"
        :key="kind"
        :aria-pressed="selectedKind === kind"
        @click="selectedKind = kind"
      >
        {{ kind }}
      </button>
    </div>
    <ol data-testid="activity-list">
      <li v-for="activity in visible" :key="activity.id">
        <strong>{{ activity.label }}</strong>
        <span class="muted">{{ activity.minutes }} minutes ago</span>
      </li>
    </ol>
  </article>
</template>
