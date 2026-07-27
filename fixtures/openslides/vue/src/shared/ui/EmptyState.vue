<script setup lang="ts">
import type { Component } from "vue";
import { cn } from "$lib/lib/utils";

withDefaults(
  defineProps<{
    icon: Component;
    title: string;
    description?: string;
    compact?: boolean;
    class?: string;
  }>(),
  { description: undefined, compact: false, class: undefined },
);
</script>

<template>
  <div
    :class="
      cn(
        'flex flex-col items-center justify-center text-center',
        compact
          ? 'py-10'
          : 'rounded-2xl border-2 border-dashed border-muted bg-muted/20 py-24',
        $props.class,
      )
    "
  >
    <div
      :class="
        cn(
          'mb-4 flex items-center justify-center rounded-full bg-muted',
          compact ? 'h-10 w-10' : 'h-16 w-16',
        )
      "
    >
      <component
        :is="icon"
        :class="
          cn('text-muted-foreground', compact ? 'h-5 w-5' : 'h-8 w-8')
        "
      />
    </div>
    <h2 :class="cn('mb-2 font-semibold', compact ? 'text-sm' : 'text-xl')">
      {{ title }}
    </h2>
    <p
      v-if="description"
      :class="
        cn(
          'max-w-sm text-muted-foreground',
          compact ? 'mb-3 text-xs' : 'mb-5',
        )
      "
    >
      {{ description }}
    </p>
    <div v-if="$slots.default" class="flex gap-2">
      <slot />
    </div>
  </div>
</template>
