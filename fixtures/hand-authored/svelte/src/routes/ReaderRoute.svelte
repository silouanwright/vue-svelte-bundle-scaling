<script>
  import AnnotationComposer from "../components/reader/AnnotationComposer.svelte";
  import ContentsTree from "../components/reader/ContentsTree.svelte";
  import ReaderViewport from "../components/reader/ReaderViewport.svelte";

  let section = $state("introduction");
</script>

<section class="feature-route" data-testid="view-reader">
  <header><p class="muted">Focused document reading</p><h2>Reader</h2></header>
  <div class="feature-grid">
    <ContentsTree bind:selected={section} />
    <ReaderViewport {section} />
    <AnnotationComposer {section} />
  </div>
</section>
