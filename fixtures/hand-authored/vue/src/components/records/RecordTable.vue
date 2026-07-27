<script setup>
import { tableRecords } from "@shared/catalog.js";
import { computed, ref } from "vue";

const sortKey = ref("title");
const descending = ref(false);
const selected = ref(new Set());
const rows = computed(() =>
  tableRecords.toSorted((left, right) => {
    const result = String(left[sortKey.value]).localeCompare(String(right[sortKey.value]), undefined, { numeric: true });
    return descending.value ? -result : result;
  }),
);
function sort(key) {
  descending.value = sortKey.value === key ? !descending.value : false;
  sortKey.value = key;
}
function toggle(id) {
  const next = new Set(selected.value);
  next.has(id) ? next.delete(id) : next.add(id);
  selected.value = next;
}
</script>

<template>
  <article class="panel stack">
    <h3>Document records</h3>
    <table>
      <thead><tr><th>Select</th><th><button @click="sort('title')">Title</button></th><th>Status</th><th><button @click="sort('pages')">Pages</button></th></tr></thead>
      <tbody>
        <tr v-for="row in rows" :key="row.id" :class="{ selected: selected.has(row.id) }">
          <td><input type="checkbox" :checked="selected.has(row.id)" @change="toggle(row.id)" /></td>
          <td>{{ row.title }}</td><td>{{ row.status }}</td><td>{{ row.pages }}</td>
        </tr>
      </tbody>
    </table>
    <output data-testid="selected-records">{{ selected.size }} selected</output>
  </article>
</template>
