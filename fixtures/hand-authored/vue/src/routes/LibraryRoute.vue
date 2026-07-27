<script setup>
import CollectionTree from "../components/library/CollectionTree.vue";
import ImportQueue from "../components/library/ImportQueue.vue";
import SourceBrowser from "../components/library/SourceBrowser.vue";
</script>
<template>
  <section class="feature-route" data-testid="view-library">
    <header><p class="muted">Sources and collections</p><h2>Library</h2></header>
    <div class="feature-grid"><SourceBrowser /><CollectionTree /><ImportQueue /></div>
  </section>
</template>
