<script setup lang="ts">
import { nextTick, ref, watch } from "vue";
import Button from "./Button.vue";
import Overlay, { Z_INDEX } from "./Overlay.vue";

const props = withDefaults(
  defineProps<{
    open: boolean;
    title: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    destructive?: boolean;
  }>(),
  {
    description: undefined,
    confirmLabel: "Delete",
    cancelLabel: "Cancel",
    destructive: true,
  },
);
const emit = defineEmits<{ confirm: []; cancel: [] }>();
const confirmButton = ref<{ focus: () => void } | null>(null);

watch(
  () => props.open,
  async (open) => {
    if (!open) return;
    await nextTick();
    confirmButton.value?.focus();
  },
);
</script>

<template>
  <Overlay
    v-if="open"
    :z="Z_INDEX.command"
    placement="center"
    close-on-esc
    @close="emit('cancel')"
  >
    <div
      class="w-full max-w-sm rounded-xl border bg-card p-5 shadow-2xl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <h3 id="confirm-dialog-title" class="text-sm font-semibold">
        {{ title }}
      </h3>
      <p v-if="description" class="mt-2 text-xs text-muted-foreground">
        {{ description }}
      </p>
      <div class="mt-4 flex justify-end gap-2">
        <Button variant="outline" size="sm" @click="emit('cancel')">
          {{ cancelLabel }}
        </Button>
        <Button
          ref="confirmButton"
          :variant="destructive ? 'destructive' : 'default'"
          size="sm"
          @click="emit('confirm')"
        >
          {{ confirmLabel }}
        </Button>
      </div>
    </div>
  </Overlay>
</template>
