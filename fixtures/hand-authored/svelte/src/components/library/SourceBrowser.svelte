<script>
  import { librarySources } from "@shared/catalog.js";
  let query = $state("");
  let connectedOnly = $state(false);
  let selected = $state(null);
  let visible = $derived(librarySources.filter((source) => source.title.toLowerCase().includes(query.toLowerCase())).filter((source) => !connectedOnly || source.connected));
</script>
<article class="panel stack">
  <h3>Sources</h3>
  <input bind:value={query} type="search" placeholder="Filter sources" data-testid="source-query" />
  <label class="inline"><input bind:checked={connectedOnly} type="checkbox" /> Connected only</label>
  {#each visible as source (source.id)}
    <button class:selected={selected === source.id} onclick={() => (selected = source.id)}>{source.title} <small>{source.documents} documents · {source.connected ? "connected" : "offline"}</small></button>
  {/each}
</article>
