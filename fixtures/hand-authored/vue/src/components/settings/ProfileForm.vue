<script setup>
import { computed, ref } from "vue";
const name = ref("Mara Chen");
const email = ref("mara@example.test");
const role = ref("Researcher");
const saved = ref(false);
const valid = computed(() => name.value.trim().length > 2 && email.value.includes("@"));
function submit() { saved.value = valid.value; }
</script>
<template>
  <form class="panel stack" @submit.prevent="submit">
    <h3>Profile</h3>
    <label>Name <input v-model="name" data-testid="profile-name" /></label>
    <label>Email <input v-model="email" type="email" /></label>
    <label>Role <select v-model="role"><option>Researcher</option><option>Editor</option><option>Administrator</option></select></label>
    <button :disabled="!valid">Save profile</button>
    <p v-if="saved">Profile saved</p>
  </form>
</template>
