<script setup>
import { revisions } from "@shared/catalog.js";
import { ref } from "vue";
const selected = ref(revisions[0].id);
</script>
<template>
  <aside class="panel stack">
    <h3>Revision history</h3>
    <button v-for="revision in revisions" :key="revision.id" :class="{ selected: selected === revision.id }" @click="selected = revision.id">
      <strong>v{{ revision.id }}</strong> {{ revision.summary }} <small>{{ revision.author }}, {{ revision.time }}</small>
    </button>
    <button @click="selected = revisions[0].id">Restore latest</button>
  </aside>
</template>
