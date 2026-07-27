<script>
  import ProfileForm from "../components/settings/ProfileForm.svelte";
  import ShortcutEditor from "../components/settings/ShortcutEditor.svelte";
  import ThemeChooser from "../components/settings/ThemeChooser.svelte";
</script>
<section class="feature-route" data-testid="view-settings">
  <header><p class="muted">Personalize the workspace</p><h2>Settings</h2></header>
  <div class="feature-grid"><ProfileForm /><ThemeChooser /><ShortcutEditor /></div>
</section>
