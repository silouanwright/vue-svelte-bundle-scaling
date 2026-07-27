<script>
  import AutosaveStatus from "../components/editor/AutosaveStatus.svelte";
  import DocumentEditor from "../components/editor/DocumentEditor.svelte";
  import RevisionHistory from "../components/editor/RevisionHistory.svelte";
  let body = $state("Bundle size is an application property.");
</script>
<section class="feature-route" data-testid="view-editor">
  <header><p class="muted">Draft and review</p><h2>Editor</h2></header>
  <div class="feature-grid"><DocumentEditor bind:body /><div class="stack"><AutosaveStatus {body} /><RevisionHistory /></div></div>
</section>
