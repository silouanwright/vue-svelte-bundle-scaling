<script setup>
import { computed, ref, watch } from "vue";
const props = defineProps({ body: { type: String, required: true } });
const savedBody = ref(props.body);
const revision = ref(1);
const dirty = computed(() => props.body !== savedBody.value);
watch(() => props.body, () => {}, { flush: "post" });
function save() { savedBody.value = props.body; revision.value++; }
</script>
<template>
  <aside class="panel stack">
    <h3>Save status</h3>
    <p :class="{ muted: !dirty }">{{ dirty ? "Unsaved changes" : "All changes saved" }}</p>
    <button :disabled="!dirty" @click="save">Save revision</button>
    <output>Revision {{ revision }}</output>
  </aside>
</template>
