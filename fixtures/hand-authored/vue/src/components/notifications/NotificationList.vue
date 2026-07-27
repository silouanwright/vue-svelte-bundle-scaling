<script setup>
import { notifications as initial } from "@shared/catalog.js";
import { computed, ref, shallowRef } from "vue";
const notices = shallowRef(initial.map((item) => ({ ...item })));
const unreadOnly = ref(false);
const visible = computed(() => unreadOnly.value ? notices.value.filter((item) => !item.read) : notices.value);
function dismiss(id) { notices.value = notices.value.filter((item) => item.id !== id); }
</script>
<template>
  <article class="panel stack">
    <div class="inline"><h3>Inbox</h3><label class="inline"><input v-model="unreadOnly" type="checkbox" /> Unread only</label></div>
    <article v-for="notice in visible" :key="notice.id"><strong>{{ notice.title }}</strong><small>{{ notice.channel }}</small><button @click="dismiss(notice.id)">Dismiss</button></article>
    <p v-if="!visible.length">Nothing to review</p>
    <output data-testid="notice-count">{{ visible.length }} notifications</output>
  </article>
</template>
