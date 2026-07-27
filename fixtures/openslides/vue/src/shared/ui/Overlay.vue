<script lang="ts">
export const Z_INDEX = {
  editorExpanded: 90,
  drawerBackdrop: 40,
  drawer: 50,
  contextMenu: 100,
  presentation: 100,
  presentationControls: 110,
  presentationProgress: 120,
  hoverPreview: 200,
  command: 200,
  shortcuts: 210,
} as const;
</script>

<script setup lang="ts">
import { onBeforeUnmount, onMounted } from "vue";
import { cn } from "$lib/lib/utils";

const props = withDefaults(
  defineProps<{
    z?: number;
    placement?: "center" | "top";
    closeOnEsc?: boolean;
    class?: string;
  }>(),
  {
    z: Z_INDEX.command,
    placement: "center",
    closeOnEsc: false,
    class: undefined,
  },
);
const emit = defineEmits<{ close: [] }>();

function onKeydown(event: KeyboardEvent) {
  if (props.closeOnEsc && event.key === "Escape") emit("close");
}

onMounted(() => window.addEventListener("keydown", onKeydown));
onBeforeUnmount(() => window.removeEventListener("keydown", onKeydown));
</script>

<template>
  <Transition name="overlay-fade">
    <div
      :class="
        cn(
          'fixed inset-0 flex bg-black/50 backdrop-blur-sm',
          placement === 'center'
            ? 'items-center justify-center p-4'
            : 'items-start justify-center pt-[15vh]',
        )
      "
      :style="{ zIndex: z }"
    >
      <div
        class="absolute inset-0"
        role="presentation"
        @click="emit('close')"
      />
      <div :class="cn('relative', $props.class)">
        <slot />
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.overlay-fade-enter-active,
.overlay-fade-leave-active {
  transition: opacity 120ms ease;
}
.overlay-fade-enter-from,
.overlay-fade-leave-to {
  opacity: 0;
}
</style>
