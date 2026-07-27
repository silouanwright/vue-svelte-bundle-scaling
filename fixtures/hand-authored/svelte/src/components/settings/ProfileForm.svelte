<script>
  let name = $state("Mara Chen");
  let email = $state("mara@example.test");
  let role = $state("Researcher");
  let saved = $state(false);
  let valid = $derived(name.trim().length > 2 && email.includes("@"));
  function submit(event) { event.preventDefault(); saved = valid; }
</script>
<form class="panel stack" onsubmit={submit}>
  <h3>Profile</h3>
  <label>Name <input bind:value={name} data-testid="profile-name" /></label>
  <label>Email <input bind:value={email} type="email" /></label>
  <label>Role <select bind:value={role}><option>Researcher</option><option>Editor</option><option>Administrator</option></select></label>
  <button disabled={!valid}>Save profile</button>
  {#if saved}<p>Profile saved</p>{/if}
</form>
