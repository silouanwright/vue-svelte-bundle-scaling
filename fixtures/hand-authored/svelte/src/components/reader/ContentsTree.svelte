<script>
  import { readerSections } from "@shared/catalog.js";
  let { selected = $bindable() } = $props();
</script>

<nav class="panel stack" aria-label="Document contents">
  <h3>Contents</h3>
  {#each readerSections as section (section.id)}
    <button aria-current={selected === section.id ? "location" : undefined} onclick={() => (selected = section.id)}>
      {section.label} <small>{section.words} words</small>
    </button>
  {/each}
</nav>
