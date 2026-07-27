<script setup>
import { ref } from "vue";

const columns = ref([
  { id: "owner", label: "Owner", visible: true },
  { id: "status", label: "Status", visible: true },
  { id: "pages", label: "Page count", visible: false },
  { id: "updated", label: "Last updated", visible: false },
]);
</script>

<template>
  <aside class="panel stack">
    <h3>Visible columns</h3>
    <label v-for="column in columns" :key="column.id" class="inline">
      <input v-model="column.visible" type="checkbox" /> {{ column.label }}
    </label>
    <output>{{ columns.filter((column) => column.visible).length }} shown</output>
  </aside>
</template>
