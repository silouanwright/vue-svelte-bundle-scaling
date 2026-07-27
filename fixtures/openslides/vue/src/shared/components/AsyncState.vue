<script setup lang="ts">
import { Loader2 } from "lucide-vue-next";

withDefaults(
  defineProps<{
    isLoading: boolean;
    isError: boolean;
    error?: Error | null;
    loadingLabel?: string;
  }>(),
  { error: null, loadingLabel: "Loading…" },
);
</script>

<template>
  <div
    v-if="isLoading"
    class="flex flex-1 items-center justify-center gap-2 text-muted-foreground"
  >
    <Loader2 class="h-5 w-5 animate-spin" />
    {{ loadingLabel }}
  </div>
  <div
    v-else-if="isError"
    class="flex flex-1 flex-col items-center justify-center gap-3"
  >
    <p class="text-destructive">
      {{ error?.message ?? "Something went wrong" }}
    </p>
    <slot name="error-action" />
  </div>
  <slot v-else />
</template>
