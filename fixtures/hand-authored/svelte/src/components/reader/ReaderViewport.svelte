<script>
  import { readerSections } from "@shared/catalog.js";
  let { section } = $props();
  let fontSize = $state(18);
  let lineWidth = $state("normal");
  let current = $derived(readerSections.find((item) => item.id === section));
</script>

<article class="panel stack" style:font-size={`${fontSize}px`} style:max-width={lineWidth === "narrow" ? "36rem" : "52rem"}>
  <div class="inline">
    <button aria-label="Decrease text size" onclick={() => (fontSize = Math.max(14, fontSize - 1))}>A−</button>
    <button aria-label="Increase text size" onclick={() => (fontSize = Math.min(24, fontSize + 1))}>A+</button>
    <select bind:value={lineWidth} aria-label="Line width"><option>normal</option><option>narrow</option></select>
  </div>
  <h3 data-testid="reader-section">{current.label}</h3>
  <p>This section contains {current.words} words of representative reading material.</p>
  <blockquote>Measured software claims should remain attached to the experiment that produced them.</blockquote>
</article>
