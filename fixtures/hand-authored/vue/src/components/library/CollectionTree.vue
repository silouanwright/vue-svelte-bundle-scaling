<script setup>
import { ref } from "vue";
const nodes = ref([{ id: "research", label: "Research", open: true, children: ["Benchmarks", "Architecture"] }, { id: "books", label: "Books", open: false, children: ["Primary", "Secondary"] }, { id: "archive", label: "Archive", open: false, children: ["2025", "2026"] }]);
</script>
<template>
  <nav class="panel stack" aria-label="Collections">
    <h3>Collections</h3>
    <section v-for="node in nodes" :key="node.id">
      <button :aria-expanded="node.open" @click="node.open = !node.open">{{ node.open ? "▾" : "▸" }} {{ node.label }}</button>
      <ul v-if="node.open"><li v-for="child in node.children" :key="child"><a :href="`#${node.id}-${child}`">{{ child }}</a></li></ul>
    </section>
  </nav>
</template>
