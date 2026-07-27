<script setup>
import { computed, ref } from "vue";

const query = defineModel({ type: String, required: true });
const mode = ref("all");
const history = ref([]);
const ready = computed(() => query.value.trim().length >= 2);

function submit() {
  if (ready.value && !history.value.includes(query.value)) history.value.unshift(query.value);
}
</script>

<template>
  <form class="panel stack" @submit.prevent="submit">
    <label>
      Query
      <input v-model="query" type="search" data-testid="search-query" />
    </label>
    <div class="inline">
      <label><input v-model="mode" type="radio" value="all" /> All words</label>
      <label><input v-model="mode" type="radio" value="exact" /> Exact phrase</label>
      <button :disabled="!ready">Search</button>
    </div>
    <small v-if="history.length">Recent: {{ history.join(", ") }}</small>
  </form>
</template>
