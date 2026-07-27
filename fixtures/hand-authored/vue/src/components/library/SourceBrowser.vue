<script setup>
import { librarySources } from "@shared/catalog.js";
import { computed, ref } from "vue";
const query = ref("");
const connectedOnly = ref(false);
const selected = ref(null);
const visible = computed(() => librarySources.filter((source) => source.title.toLowerCase().includes(query.value.toLowerCase())).filter((source) => !connectedOnly.value || source.connected));
</script>
<template>
  <article class="panel stack">
    <h3>Sources</h3>
    <input v-model="query" type="search" placeholder="Filter sources" data-testid="source-query" />
    <label class="inline"><input v-model="connectedOnly" type="checkbox" /> Connected only</label>
    <button v-for="source in visible" :key="source.id" :class="{ selected: selected === source.id }" @click="selected = source.id">
      {{ source.title }} <small>{{ source.documents }} documents · {{ source.connected ? "connected" : "offline" }}</small>
    </button>
  </article>
</template>
