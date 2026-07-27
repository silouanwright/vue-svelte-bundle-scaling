<script setup>
import { ref } from "vue";

import AnnotationComposer from "../components/reader/AnnotationComposer.vue";
import ContentsTree from "../components/reader/ContentsTree.vue";
import ReaderViewport from "../components/reader/ReaderViewport.vue";

const section = ref("introduction");
</script>

<template>
  <section class="feature-route" data-testid="view-reader">
    <header><p class="muted">Focused document reading</p><h2>Reader</h2></header>
    <div class="feature-grid">
      <ContentsTree v-model="section" />
      <ReaderViewport :section="section" />
      <AnnotationComposer :section="section" />
    </div>
  </section>
</template>
