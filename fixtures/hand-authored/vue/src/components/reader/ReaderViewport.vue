<script setup>
import { readerSections } from "@shared/catalog.js";
import { computed, ref } from "vue";

const props = defineProps({ section: { type: String, required: true } });
const fontSize = ref(18);
const lineWidth = ref("normal");
const current = computed(() => readerSections.find((item) => item.id === props.section));
</script>

<template>
  <article class="panel stack" :style="{ fontSize: `${fontSize}px`, maxWidth: lineWidth === 'narrow' ? '36rem' : '52rem' }">
    <div class="inline">
      <button aria-label="Decrease text size" @click="fontSize = Math.max(14, fontSize - 1)">A−</button>
      <button aria-label="Increase text size" @click="fontSize = Math.min(24, fontSize + 1)">A+</button>
      <select v-model="lineWidth" aria-label="Line width"><option>normal</option><option>narrow</option></select>
    </div>
    <h3 data-testid="reader-section">{{ current.label }}</h3>
    <p>This section contains {{ current.words }} words of representative reading material.</p>
    <blockquote>Measured software claims should remain attached to the experiment that produced them.</blockquote>
  </article>
</template>
