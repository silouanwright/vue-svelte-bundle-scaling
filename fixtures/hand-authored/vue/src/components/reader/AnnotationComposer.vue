<script setup>
import { computed, ref } from "vue";

const props = defineProps({ section: { type: String, required: true } });
const note = ref("");
const kind = ref("observation");
const saved = ref([]);
const canSave = computed(() => note.value.trim().length >= 4);
function save() {
  if (!canSave.value) return;
  saved.value.push({ id: Date.now(), section: props.section, kind: kind.value, text: note.value.trim() });
  note.value = "";
}
</script>

<template>
  <aside class="panel stack">
    <h3>Annotation</h3>
    <label>Kind <select v-model="kind"><option>observation</option><option>question</option><option>citation</option></select></label>
    <label>Note <textarea v-model="note" rows="4" data-testid="annotation-note" /></label>
    <button :disabled="!canSave" @click="save">Save annotation</button>
    <output data-testid="annotation-count">{{ saved.length }} saved</output>
  </aside>
</template>
