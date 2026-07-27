<script setup>
import { ref } from "vue";
import AutosaveStatus from "../components/editor/AutosaveStatus.vue";
import DocumentEditor from "../components/editor/DocumentEditor.vue";
import RevisionHistory from "../components/editor/RevisionHistory.vue";
const body = ref("Bundle size is an application property.");
</script>
<template>
  <section class="feature-route" data-testid="view-editor">
    <header><p class="muted">Draft and review</p><h2>Editor</h2></header>
    <div class="feature-grid"><DocumentEditor v-model="body" /><div class="stack"><AutosaveStatus :body="body" /><RevisionHistory /></div></div>
  </section>
</template>
