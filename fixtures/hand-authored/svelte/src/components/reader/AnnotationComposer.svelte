<script>
  let { section } = $props();
  let note = $state("");
  let kind = $state("observation");
  let saved = $state([]);
  let canSave = $derived(note.trim().length >= 4);
  function save() {
    if (!canSave) return;
    saved.push({ id: Date.now(), section, kind, text: note.trim() });
    note = "";
  }
</script>

<aside class="panel stack">
  <h3>Annotation</h3>
  <label>Kind <select bind:value={kind}><option>observation</option><option>question</option><option>citation</option></select></label>
  <label>Note <textarea bind:value={note} rows="4" data-testid="annotation-note"></textarea></label>
  <button disabled={!canSave} onclick={save}>Save annotation</button>
  <output data-testid="annotation-count">{saved.length} saved</output>
</aside>
