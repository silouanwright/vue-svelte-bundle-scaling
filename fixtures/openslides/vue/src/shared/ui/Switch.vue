<script setup lang="ts">
import { computed } from "vue";
import { cn } from "$lib/lib/utils";

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    disabled?: boolean;
    class?: string;
  }>(),
  { disabled: false, class: undefined },
);
const emit = defineEmits<{ "update:modelValue": [value: boolean] }>();
const state = computed(() => (props.modelValue ? "checked" : "unchecked"));
</script>

<template>
  <button
    type="button"
    role="switch"
    :aria-checked="modelValue"
    :disabled="disabled"
    :data-state="state"
    :class="
      cn(
        'peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-[background-color,transform] focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-card focus-visible:outline-none active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input',
        $props.class,
      )
    "
    @click="emit('update:modelValue', !modelValue)"
  >
    <span
      :data-state="state"
      class="pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
    />
  </button>
</template>
