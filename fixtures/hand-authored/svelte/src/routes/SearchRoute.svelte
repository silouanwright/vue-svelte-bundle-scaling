<script>
  import FacetFilters from "../components/search/FacetFilters.svelte";
  import QueryComposer from "../components/search/QueryComposer.svelte";
  import SearchResults from "../components/search/SearchResults.svelte";

  let query = $state("");
  let selectedTypes = $state([]);
</script>

<section class="feature-route" data-testid="view-search">
  <header><p class="muted">Find across every source</p><h2>Search</h2></header>
  <QueryComposer bind:query />
  <div class="feature-grid">
    <FacetFilters bind:selected={selectedTypes} />
    <SearchResults {query} {selectedTypes} />
  </div>
</section>
