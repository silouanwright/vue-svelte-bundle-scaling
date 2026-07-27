<script setup>
import { ref } from "vue";
const theme = ref("system");
const contrast = ref("standard");
const themes = [{ id: "light", swatch: "#f7f2e8" }, { id: "dark", swatch: "#252d34" }, { id: "system", swatch: "linear-gradient(90deg,#f7f2e8 50%,#252d34 50%)" }];
</script>
<template>
  <article class="panel stack">
    <h3>Appearance</h3>
    <button v-for="option in themes" :key="option.id" :aria-pressed="theme === option.id" @click="theme = option.id">
      <span :style="{ background: option.swatch, display: 'inline-block', width: '2rem', height: '1rem' }" /> {{ option.id }}
    </button>
    <label>Contrast <select v-model="contrast"><option>standard</option><option>high</option></select></label>
    <output data-testid="theme-choice">{{ theme }} / {{ contrast }}</output>
  </article>
</template>
