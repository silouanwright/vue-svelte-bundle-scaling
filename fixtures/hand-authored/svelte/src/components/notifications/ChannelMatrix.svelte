<script>
  let channels = $state([{ id: "indexing", label: "Indexing", email: false, desktop: true }, { id: "review", label: "Review", email: true, desktop: true }, { id: "system", label: "System", email: true, desktop: false }]);
</script>
<article class="panel stack">
  <h3>Channels</h3>
  <table><thead><tr><th>Channel</th><th>Email</th><th>Desktop</th></tr></thead><tbody>
    {#each channels as channel (channel.id)}<tr><td>{channel.label}</td><td><input bind:checked={channel.email} type="checkbox" /></td><td><input bind:checked={channel.desktop} type="checkbox" /></td></tr>{/each}
  </tbody></table>
  <output>{channels.filter((item) => item.email || item.desktop).length} active</output>
</article>
