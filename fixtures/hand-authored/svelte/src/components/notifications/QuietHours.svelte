<script>
  let enabled = $state(true);
  let start = $state("21:00");
  let end = $state("07:00");
  let summary = $derived(enabled ? `Muted from ${start} until ${end}` : "Notifications always allowed");
</script>
<form class="panel stack">
  <h3>Quiet hours</h3>
  <label class="inline"><input bind:checked={enabled} type="checkbox" /> Enable schedule</label>
  <label>Start <input bind:value={start} type="time" disabled={!enabled} /></label>
  <label>End <input bind:value={end} type="time" disabled={!enabled} /></label>
  <output data-testid="quiet-summary">{summary}</output>
</form>
