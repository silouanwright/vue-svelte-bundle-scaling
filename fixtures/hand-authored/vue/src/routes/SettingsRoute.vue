<script setup>
import ProfileForm from "../components/settings/ProfileForm.vue";
import ShortcutEditor from "../components/settings/ShortcutEditor.vue";
import ThemeChooser from "../components/settings/ThemeChooser.vue";
</script>
<template>
  <section class="feature-route" data-testid="view-settings">
    <header><p class="muted">Personalize the workspace</p><h2>Settings</h2></header>
    <div class="feature-grid"><ProfileForm /><ThemeChooser /><ShortcutEditor /></div>
  </section>
</template>
