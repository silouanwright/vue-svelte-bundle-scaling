<script>
  let shortcuts = $state([{ id: "search", label: "Open search", keys: "⌘K" }, { id: "reader", label: "Focus reader", keys: "⌘R" }, { id: "save", label: "Save document", keys: "⌘S" }]);
  let editing = $state(null);
  function reset() { shortcuts = shortcuts.map((item) => ({ ...item, keys: item.id === "search" ? "⌘K" : item.id === "reader" ? "⌘R" : "⌘S" })); }
</script>
<article class="panel stack">
  <h3>Keyboard shortcuts</h3>
  {#each shortcuts as shortcut (shortcut.id)}
    <label>{shortcut.label}<input bind:value={shortcut.keys} onfocus={() => (editing = shortcut.id)} /></label>
  {/each}
  {#if editing}<small>Editing {editing}</small>{/if}
  <button onclick={reset}>Restore defaults</button>
</article>
