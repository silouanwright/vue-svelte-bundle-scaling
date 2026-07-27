<script setup>
import { computed } from "vue";
const body = defineModel({ type: String, required: true });
const words = computed(() => body.value.trim().split(/\s+/).filter(Boolean).length);
function insertCitation() { body.value += "\n\n[Source, page 42]"; }
</script>
<template>
  <article class="panel stack">
    <div class="inline"><h3>Draft</h3><button @click="insertCitation">Insert citation</button></div>
    <textarea v-model="body" rows="12" data-testid="editor-body" />
    <output data-testid="word-count">{{ words }} words</output>
  </article>
</template>
