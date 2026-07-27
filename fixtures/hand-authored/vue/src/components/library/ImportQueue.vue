<script setup>
import { computed, ref } from "vue";
const jobs = ref([{ id: 1, file: "archive-a.pdf", completed: 82, status: "running" }, { id: 2, file: "notes.docx", completed: 100, status: "complete" }, { id: 3, file: "scan.pdf", completed: 0, status: "failed" }]);
const active = computed(() => jobs.value.filter((job) => job.status === "running").length);
function retry(job) { job.status = "running"; job.completed = 1; }
</script>
<template>
  <aside class="panel stack">
    <h3>Import queue</h3>
    <article v-for="job in jobs" :key="job.id"><strong>{{ job.file }}</strong><progress :value="job.completed" max="100" /><button v-if="job.status === 'failed'" @click="retry(job)">Retry</button></article>
    <output data-testid="active-imports">{{ active }} active imports</output>
  </aside>
</template>
