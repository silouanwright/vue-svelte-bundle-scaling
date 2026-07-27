<script setup>
import { ref } from "vue";
const channels = ref([{ id: "indexing", label: "Indexing", email: false, desktop: true }, { id: "review", label: "Review", email: true, desktop: true }, { id: "system", label: "System", email: true, desktop: false }]);
</script>
<template>
  <article class="panel stack">
    <h3>Channels</h3>
    <table><thead><tr><th>Channel</th><th>Email</th><th>Desktop</th></tr></thead><tbody>
      <tr v-for="channel in channels" :key="channel.id"><td>{{ channel.label }}</td><td><input v-model="channel.email" type="checkbox" /></td><td><input v-model="channel.desktop" type="checkbox" /></td></tr>
    </tbody></table>
    <output>{{ channels.filter((item) => item.email || item.desktop).length }} active</output>
  </article>
</template>
