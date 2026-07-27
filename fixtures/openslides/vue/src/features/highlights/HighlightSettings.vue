<script setup lang="ts">
import type { Highlight } from "$lib/types";
import SliderField from "$lib/ui/SliderField.vue";
import Switch from "$lib/ui/Switch.vue";

defineProps<{ highlight: Highlight }>();
const emit = defineEmits<{ update: [patch: Partial<Highlight>] }>();
</script>

<template>
  <div class="mt-3 space-y-4 border-t border-border/50 pt-3">
    <p class="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
      Step settings
    </p>
    <SliderField
      label="Dim"
      :value="highlight.dimAmount"
      :min="0"
      :max="100"
      :step="1"
      :format="(value) => `${value}%`"
      @commit="emit('update', { dimAmount: $event })"
    />
    <label class="flex items-center justify-between gap-3 text-[10px]">
      Scale selected lines
      <Switch
        :model-value="highlight.sizeUpEnabled"
        @update:model-value="emit('update', { sizeUpEnabled: $event })"
      />
    </label>
    <SliderField
      label="Scale"
      :value="highlight.sizeUpAmount"
      :min="100"
      :max="175"
      :step="1"
      :disabled="!highlight.sizeUpEnabled"
      :format="(value) => `${value}%`"
      @commit="emit('update', { sizeUpAmount: $event })"
    />
    <label class="flex items-center justify-between gap-3 text-[10px]">
      Custom timing
      <Switch
        :model-value="highlight.useCustomTransition"
        @update:model-value="
          emit('update', { useCustomTransition: $event })
        "
      />
    </label>
    <div v-if="highlight.useCustomTransition" class="space-y-4">
      <SliderField
        label="Dim transition"
        :value="highlight.dimTransition"
        :min="0"
        :max="2000"
        :step="50"
        :format="(value) => `${value}ms`"
        @commit="emit('update', { dimTransition: $event })"
      />
      <SliderField
        label="Scale transition"
        :value="highlight.sizeUpTransition"
        :min="0"
        :max="2000"
        :step="50"
        :format="(value) => `${value}ms`"
        @commit="emit('update', { sizeUpTransition: $event })"
      />
    </div>
  </div>
</template>
