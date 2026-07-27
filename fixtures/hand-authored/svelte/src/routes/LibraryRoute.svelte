<script>
  import CollectionTree from "../components/library/CollectionTree.svelte";
  import ImportQueue from "../components/library/ImportQueue.svelte";
  import SourceBrowser from "../components/library/SourceBrowser.svelte";
</script>
<section class="feature-route" data-testid="view-library">
  <header><p class="muted">Sources and collections</p><h2>Library</h2></header>
  <div class="feature-grid"><SourceBrowser /><CollectionTree /><ImportQueue /></div>
</section>
