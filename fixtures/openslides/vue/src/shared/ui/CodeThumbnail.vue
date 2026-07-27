<script setup lang="ts">
import { themeBackground } from "$lib/lib/themes";
import { cn } from "$lib/lib/utils";

withDefaults(
  defineProps<{
    html: string | null;
    theme: string;
    fontSize?: number;
    lineHeight?: number;
    class?: string;
    codeClassName?: string;
  }>(),
  {
    fontSize: 5.5,
    lineHeight: 1.35,
    class: undefined,
    codeClassName: undefined,
  },
);
</script>

<template>
  <div
    :class="cn('relative w-full overflow-hidden', $props.class)"
    :style="{ backgroundColor: themeBackground(theme) }"
    aria-hidden="true"
  >
    <code
      v-if="html"
      :class="
        cn(
          'pointer-events-none block overflow-hidden font-mono',
          codeClassName,
        )
      "
      :style="{
        fontSize: `${fontSize}px`,
        lineHeight,
        whiteSpace: 'pre',
      }"
      v-html="html"
    />
    <slot v-else name="fallback" />
  </div>
</template>
