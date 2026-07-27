<script setup>
import { ref } from "vue";

import FacetFilters from "../components/search/FacetFilters.vue";
import QueryComposer from "../components/search/QueryComposer.vue";
import SearchResults from "../components/search/SearchResults.vue";

const query = ref("");
const selectedTypes = ref([]);
</script>

<template>
  <section class="feature-route" data-testid="view-search">
    <header><p class="muted">Find across every source</p><h2>Search</h2></header>
    <QueryComposer v-model="query" />
    <div class="feature-grid">
      <FacetFilters v-model="selectedTypes" />
      <SearchResults :query="query" :selected-types="selectedTypes" />
    </div>
  </section>
</template>
