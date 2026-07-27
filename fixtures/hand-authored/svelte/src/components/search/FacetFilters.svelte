<script>
  let { selected = $bindable() } = $props();
  const facets = [
    { value: "Document", label: "Documents", count: 2 },
    { value: "Note", label: "Notes", count: 1 },
    { value: "Checklist", label: "Checklists", count: 1 },
  ];
</script>

<aside class="panel stack">
  <h3>Type filters</h3>
  {#each facets as facet (facet.value)}
    <label class="inline">
      <input bind:group={selected} type="checkbox" value={facet.value} />
      {facet.label} <span class="muted">{facet.count}</span>
    </label>
  {/each}
  {#if selected.length}<button onclick={() => (selected = [])}>Clear filters</button>{/if}
</aside>
