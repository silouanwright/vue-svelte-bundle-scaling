<script>
  let page = $state(1);
  let pageSize = $state(25);
  const total = 186;
  let pages = $derived(Math.ceil(total / pageSize));
  let range = $derived(`${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, total)}`);
</script>

<nav class="panel stack" aria-label="Record pages">
  <h3>Pages</h3>
  <label>Rows <select bind:value={pageSize} onchange={() => (page = 1)}><option value={25}>25</option><option value={50}>50</option></select></label>
  <div class="inline">
    <button disabled={page === 1} onclick={() => page--}>Previous</button>
    <output data-testid="page-range">{range} of {total}</output>
    <button disabled={page === pages} onclick={() => page++}>Next</button>
  </div>
</nav>
