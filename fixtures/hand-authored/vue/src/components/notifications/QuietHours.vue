<script setup>
import { computed, ref } from "vue";
const enabled = ref(true);
const start = ref("21:00");
const end = ref("07:00");
const summary = computed(() => enabled.value ? `Muted from ${start.value} until ${end.value}` : "Notifications always allowed");
</script>
<template>
  <form class="panel stack">
    <h3>Quiet hours</h3>
    <label class="inline"><input v-model="enabled" type="checkbox" /> Enable schedule</label>
    <label>Start <input v-model="start" type="time" :disabled="!enabled" /></label>
    <label>End <input v-model="end" type="time" :disabled="!enabled" /></label>
    <output data-testid="quiet-summary">{{ summary }}</output>
  </form>
</template>
