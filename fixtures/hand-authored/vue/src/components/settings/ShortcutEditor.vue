<script setup>
import { ref } from "vue";
const shortcuts = ref([{ id: "search", label: "Open search", keys: "⌘K" }, { id: "reader", label: "Focus reader", keys: "⌘R" }, { id: "save", label: "Save document", keys: "⌘S" }]);
const editing = ref(null);
function reset() { shortcuts.value = shortcuts.value.map((item) => ({ ...item, keys: item.id === "search" ? "⌘K" : item.id === "reader" ? "⌘R" : "⌘S" })); }
</script>
<template>
  <article class="panel stack">
    <h3>Keyboard shortcuts</h3>
    <label v-for="shortcut in shortcuts" :key="shortcut.id">{{ shortcut.label }}
      <input v-model="shortcut.keys" @focus="editing = shortcut.id" />
    </label>
    <small v-if="editing">Editing {{ editing }}</small>
    <button @click="reset">Restore defaults</button>
  </article>
</template>
