<script>
  let { body = $bindable() } = $props();
  let words = $derived(body.trim().split(/\s+/).filter(Boolean).length);
  function insertCitation() { body += "\n\n[Source, page 42]"; }
</script>
<article class="panel stack">
  <div class="inline"><h3>Draft</h3><button onclick={insertCitation}>Insert citation</button></div>
  <textarea bind:value={body} rows="12" data-testid="editor-body"></textarea>
  <output data-testid="word-count">{words} words</output>
</article>
