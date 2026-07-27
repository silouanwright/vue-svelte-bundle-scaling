<script setup lang="ts">
import { cn } from "$lib/lib/utils";

withDefaults(
  defineProps<{
    title?: string;
    borderless?: boolean;
    class?: string;
  }>(),
  { title: undefined, borderless: false, class: undefined },
);
</script>

<template>
  <div
    :class="
      cn(
        'flex h-11 shrink-0 items-center justify-between gap-3 bg-card/70 px-3 backdrop-blur-md',
        !borderless && 'border-b border-border/60',
        $props.class,
      )
    "
  >
    <div class="flex min-w-0 items-center gap-2">
      <slot name="leading" />
      <span
        v-if="title"
        class="truncate text-sm font-medium text-foreground/90"
      >
        {{ title }}
      </span>
    </div>
    <div class="flex shrink-0 items-center gap-1">
      <slot name="trailing" />
    </div>
  </div>
</template>
