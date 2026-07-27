<script>
  import { revisions } from "@shared/catalog.js";
  let selected = $state(revisions[0].id);
</script>
<aside class="panel stack">
  <h3>Revision history</h3>
  {#each revisions as revision (revision.id)}
    <button class:selected={selected === revision.id} onclick={() => (selected = revision.id)}>
      <strong>v{revision.id}</strong> {revision.summary} <small>{revision.author}, {revision.time}</small>
    </button>
  {/each}
  <button onclick={() => (selected = revisions[0].id)}>Restore latest</button>
</aside>
