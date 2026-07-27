<script>
  let columns = $state([
    { id: "owner", label: "Owner", visible: true },
    { id: "status", label: "Status", visible: true },
    { id: "pages", label: "Page count", visible: false },
    { id: "updated", label: "Last updated", visible: false },
  ]);
</script>

<aside class="panel stack">
  <h3>Visible columns</h3>
  {#each columns as column (column.id)}
    <label class="inline"><input bind:checked={column.visible} type="checkbox" /> {column.label}</label>
  {/each}
  <output>{columns.filter((column) => column.visible).length} shown</output>
</aside>
