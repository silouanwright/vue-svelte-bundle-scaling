<script setup>
import { readerSections } from "@shared/catalog.js";

const selected = defineModel({ type: String, required: true });
</script>

<template>
  <nav class="panel stack" aria-label="Document contents">
    <h3>Contents</h3>
    <button
      v-for="section in readerSections"
      :key="section.id"
      :aria-current="selected === section.id ? 'location' : undefined"
      @click="selected = section.id"
    >
      {{ section.label }} <small>{{ section.words }} words</small>
    </button>
  </nav>
</template>
