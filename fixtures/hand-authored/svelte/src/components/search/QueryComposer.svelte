<script>
  let { query = $bindable() } = $props();
  let mode = $state("all");
  let history = $state([]);
  let ready = $derived(query.trim().length >= 2);

  function submit(event) {
    event.preventDefault();
    if (ready && !history.includes(query)) history.unshift(query);
  }
</script>

<form class="panel stack" onsubmit={submit}>
  <label>
    Query
    <input bind:value={query} type="search" data-testid="search-query" />
  </label>
  <div class="inline">
    <label><input bind:group={mode} type="radio" value="all" /> All words</label>
    <label><input bind:group={mode} type="radio" value="exact" /> Exact phrase</label>
    <button disabled={!ready}>Search</button>
  </div>
  {#if history.length}<small>Recent: {history.join(", ")}</small>{/if}
</form>
