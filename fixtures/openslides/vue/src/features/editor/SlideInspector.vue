<script setup lang="ts">
import { ref, watch } from "vue";
import type { Slide } from "$lib/types";
import type { SlideSettingsPatch } from "$lib/lib/tauri-api";
import SliderField from "$lib/ui/SliderField.vue";

const props = defineProps<{ slide: Slide }>();
const emit = defineEmits<{ update: [patch: SlideSettingsPatch] }>();
const name = ref(props.slide.name ?? "");
watch(
  () => props.slide.id,
  () => (name.value = props.slide.name ?? ""),
);
</script>

<template>
  <div class="border-b border-border/50 bg-card/70 p-3">
    <input
      v-model="name"
      class="mb-3 h-8 w-full rounded-md border border-input bg-background px-2 text-xs"
      placeholder="Slide name"
      aria-label="Slide name"
      @change="emit('update', { name: name.trim() })"
    />
    <div class="grid grid-cols-3 gap-4">
      <SliderField
        label="Duration"
        :value="slide.duration"
        :min="500"
        :max="15000"
        :step="250"
        :format="(value) => `${(value / 1000).toFixed(1)}s`"
        @commit="emit('update', { duration: $event })"
      />
      <SliderField
        label="Transition"
        :value="slide.transitionDuration"
        :min="0"
        :max="3000"
        :step="50"
        :format="(value) => `${value}ms`"
        @commit="emit('update', { transitionDuration: $event })"
      />
      <SliderField
        label="Stagger"
        :value="slide.stagger"
        :min="0"
        :max="30"
        :step="1"
        @commit="emit('update', { stagger: $event })"
      />
    </div>
  </div>
</template>
