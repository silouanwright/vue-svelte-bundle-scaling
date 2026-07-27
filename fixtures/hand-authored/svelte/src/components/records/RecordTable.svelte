<script>
  import { tableRecords } from "@shared/catalog.js";

  let sortKey = $state("title");
  let descending = $state(false);
  let selected = $state(new Set());
  let rows = $derived(
    tableRecords.toSorted((left, right) => {
      const result = String(left[sortKey]).localeCompare(String(right[sortKey]), undefined, { numeric: true });
      return descending ? -result : result;
    }),
  );
  function sort(key) {
    descending = sortKey === key ? !descending : false;
    sortKey = key;
  }
  function toggle(id) {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    selected = next;
  }
</script>

<article class="panel stack">
  <h3>Document records</h3>
  <table>
    <thead><tr><th>Select</th><th><button onclick={() => sort("title")}>Title</button></th><th>Status</th><th><button onclick={() => sort("pages")}>Pages</button></th></tr></thead>
    <tbody>
      {#each rows as row (row.id)}
        <tr class:selected={selected.has(row.id)}>
          <td><input type="checkbox" checked={selected.has(row.id)} onchange={() => toggle(row.id)} /></td>
          <td>{row.title}</td><td>{row.status}</td><td>{row.pages}</td>
        </tr>
      {/each}
    </tbody>
  </table>
  <output data-testid="selected-records">{selected.size} selected</output>
</article>
