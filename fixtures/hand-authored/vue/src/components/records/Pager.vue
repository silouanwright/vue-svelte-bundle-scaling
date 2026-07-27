<script setup>
import { computed, ref } from "vue";

const page = ref(1);
const pageSize = ref(25);
const total = 186;
const pages = computed(() => Math.ceil(total / pageSize.value));
const range = computed(() => `${(page.value - 1) * pageSize.value + 1}–${Math.min(page.value * pageSize.value, total)}`);
</script>

<template>
  <nav class="panel stack" aria-label="Record pages">
    <h3>Pages</h3>
    <label>Rows <select v-model="pageSize" @change="page = 1"><option :value="25">25</option><option :value="50">50</option></select></label>
    <div class="inline">
      <button :disabled="page === 1" @click="page--">Previous</button>
      <output data-testid="page-range">{{ range }} of {{ total }}</output>
      <button :disabled="page === pages" @click="page++">Next</button>
    </div>
  </nav>
</template>
