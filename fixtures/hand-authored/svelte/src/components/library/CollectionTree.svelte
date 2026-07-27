<script>
  let nodes = $state([{ id: "research", label: "Research", open: true, children: ["Benchmarks", "Architecture"] }, { id: "books", label: "Books", open: false, children: ["Primary", "Secondary"] }, { id: "archive", label: "Archive", open: false, children: ["2025", "2026"] }]);
</script>
<nav class="panel stack" aria-label="Collections">
  <h3>Collections</h3>
  {#each nodes as node (node.id)}
    <section><button aria-expanded={node.open} onclick={() => (node.open = !node.open)}>{node.open ? "▾" : "▸"} {node.label}</button>
      {#if node.open}<ul>{#each node.children as child (child)}<li><a href={`#${node.id}-${child}`}>{child}</a></li>{/each}</ul>{/if}
    </section>
  {/each}
</nav>
