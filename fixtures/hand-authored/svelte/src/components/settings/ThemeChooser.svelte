<script>
  let theme = $state("system");
  let contrast = $state("standard");
  const themes = [{ id: "light", swatch: "#f7f2e8" }, { id: "dark", swatch: "#252d34" }, { id: "system", swatch: "linear-gradient(90deg,#f7f2e8 50%,#252d34 50%)" }];
</script>
<article class="panel stack">
  <h3>Appearance</h3>
  {#each themes as option (option.id)}
    <button aria-pressed={theme === option.id} onclick={() => (theme = option.id)}>
      <span style:background={option.swatch} style:display="inline-block" style:width="2rem" style:height="1rem"></span> {option.id}
    </button>
  {/each}
  <label>Contrast <select bind:value={contrast}><option>standard</option><option>high</option></select></label>
  <output data-testid="theme-choice">{theme} / {contrast}</output>
</article>
