<script>
  let { body } = $props();
  let savedBody = $state("Bundle size is an application property.");
  let revision = $state(1);
  let dirty = $derived(body !== savedBody);
  function save() { savedBody = body; revision++; }
</script>
<aside class="panel stack">
  <h3>Save status</h3>
  <p class={{ muted: !dirty }}>{dirty ? "Unsaved changes" : "All changes saved"}</p>
  <button disabled={!dirty} onclick={save}>Save revision</button>
  <output>Revision {revision}</output>
</aside>
