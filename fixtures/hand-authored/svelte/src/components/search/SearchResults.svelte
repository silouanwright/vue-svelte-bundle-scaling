<script>
  import { searchRecords } from "@shared/catalog.js";

  let { query, selectedTypes } = $props();
  let matches = $derived(
    searchRecords
      .filter((record) => !query.trim() || record.title.toLowerCase().includes(query.trim().toLowerCase()))
      .filter((record) => !selectedTypes.length || selectedTypes.includes(record.type))
      .toSorted((left, right) => right.score - left.score),
  );
</script>

<section class="panel stack">
  <h3>{matches.length} results</h3>
  {#each matches as record (record.id)}
    <article>
      <p><strong>{record.title}</strong> <span class="muted">{record.type}</span></p>
      <progress value={record.score} max="1">{record.score}</progress>
    </article>
  {/each}
  {#if !matches.length}<p data-testid="empty-results">No matching records</p>{/if}
</section>
