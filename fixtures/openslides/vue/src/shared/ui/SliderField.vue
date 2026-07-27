<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { cn } from "$lib/lib/utils";

const props = withDefaults(
  defineProps<{
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    format?: (value: number) => string;
    disabled?: boolean;
    class?: string;
    labelClassName?: string;
  }>(),
  {
    format: undefined,
    disabled: false,
    class: undefined,
    labelClassName: undefined,
  },
);
const emit = defineEmits<{ preview: [value: number]; commit: [value: number] }>();
const liveValue = ref(props.value);
const isInteracting = ref(false);
const sliderId = `slider-field-${crypto.randomUUID()}`;
const labelId = `${sliderId}-label`;

watch(
  () => props.value,
  (value) => (liveValue.value = value),
);
const displayValue = computed(() =>
  props.format ? props.format(liveValue.value) : String(liveValue.value),
);
const thumbPercent = computed(() =>
  Math.min(
    100,
    Math.max(
      0,
      ((liveValue.value - props.min) / (props.max - props.min)) * 100,
    ),
  ),
);

function preview(event: Event) {
  const value = Number((event.currentTarget as HTMLInputElement).value);
  liveValue.value = value;
  isInteracting.value = true;
  emit("preview", value);
}

function commit(event: Event) {
  const value = Number((event.currentTarget as HTMLInputElement).value);
  liveValue.value = value;
  isInteracting.value = false;
  emit("commit", value);
}
</script>

<template>
  <div :class="cn('min-w-0 space-y-2', disabled && 'opacity-45', $props.class)">
    <div class="flex items-center justify-between gap-3">
      <label
        :id="labelId"
        :for="sliderId"
        :class="
          cn(
            'block truncate text-[10px] text-muted-foreground',
            labelClassName,
          )
        "
      >
        {{ label }}
      </label>
      <span
        class="shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
        aria-hidden="true"
      >
        {{ displayValue }}
      </span>
    </div>
    <div class="relative pt-3">
      <span
        v-if="isInteracting"
        class="pointer-events-none absolute -top-3 z-10 -translate-x-1/2 rounded bg-foreground px-1.5 py-0.5 text-[10px] leading-none font-medium whitespace-nowrap text-background shadow-sm"
        :style="{ left: `${thumbPercent}%` }"
      >
        {{ displayValue }}
      </span>
      <input
        :id="sliderId"
        :aria-labelledby="labelId"
        class="h-3.5 w-full cursor-pointer accent-primary"
        type="range"
        :min="min"
        :max="max"
        :step="step"
        :disabled="disabled"
        :value="liveValue"
        @input="preview"
        @change="commit"
        @pointerup="commit"
      />
    </div>
  </div>
</template>
