<script>
  let checks = $state([
    { id: "index", label: "Search index current", done: true },
    { id: "backup", label: "Backup verified", done: true },
    { id: "review", label: "Review queue empty", done: false },
    { id: "exports", label: "Exports archived", done: false },
  ]);
  let completed = $derived(checks.filter((check) => check.done).length);
  let percent = $derived(Math.round((completed / checks.length) * 100));
</script>

<article class="panel stack">
  <h3>Workspace health</h3>
  <progress value={completed} max={checks.length}>{percent}%</progress>
  {#each checks as check (check.id)}
    <label class="inline">
      <input bind:checked={check.done} type="checkbox" />
      {check.label}
    </label>
  {/each}
  <output data-testid="health-progress">{completed}/{checks.length} complete</output>
</article>
