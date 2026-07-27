<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from "vue";
import { Copy, GripVertical, Trash2 } from "lucide-vue-next";
import type { Project, Slide } from "$lib/types";
import { slideDisplayName } from "$lib/types";
import { themeBackground } from "$lib/lib/themes";
import { ui } from "$lib/stores/ui-state";
import Button from "$lib/ui/Button.vue";
import PreviewStage from "@/features/preview/PreviewStage.vue";

const props = defineProps<{
  project: Project;
  slide: Slide;
  index: number;
  active: boolean;
  multiSelected?: boolean;
}>();
const emit = defineEmits<{
  select: [id: string, event?: MouseEvent];
  context: [slide: Slide, event: MouseEvent];
  duplicate: [id: string];
  remove: [id: string];
}>();
const background = computed(() => themeBackground(props.project.theme));
const showHoverPreview = ref(false);
const hoverPosition = ref({ left: 0, top: 0 });
let hoverTimer: ReturnType<typeof setTimeout> | undefined;

function mouseEnter(event: MouseEvent) {
  if (!ui.showSlideHoverPreview) return;
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  hoverPosition.value = {
    left: Math.min(window.innerWidth - 316, Math.max(16, rect.left)),
    top: Math.max(16, rect.top - 186),
  };
  hoverTimer = setTimeout(() => (showHoverPreview.value = true), 450);
}

function mouseLeave() {
  if (hoverTimer) clearTimeout(hoverTimer);
  showHoverPreview.value = false;
}

onBeforeUnmount(() => {
  if (hoverTimer) clearTimeout(hoverTimer);
});
</script>

<template>
  <article
    :data-slide-id="slide.id"
    class="group relative w-[220px] shrink-0 cursor-pointer overflow-hidden rounded-lg border bg-card transition-all"
    :class="
      multiSelected
        ? 'border-primary bg-primary/10 ring-2 ring-primary/40'
        : active
        ? 'border-primary ring-2 ring-primary/25'
        : 'border-border/70 hover:border-primary/50'
    "
    role="button"
    tabindex="0"
    @mouseenter="mouseEnter"
    @mouseleave="mouseLeave"
    @click="emit('select', slide.id, $event)"
    @keydown.enter="emit('select', slide.id)"
    @keydown.space.prevent="emit('select', slide.id)"
    @contextmenu.prevent.stop="emit('context', slide, $event)"
  >
    <div class="h-[118px] overflow-hidden" :style="{ backgroundColor: background }">
      <PreviewStage :project="project" :slide="slide" compact />
    </div>
    <div class="flex h-9 items-center gap-2 border-t border-border/50 px-2">
      <GripVertical
        data-slide-drag-handle
        class="drag-handle h-3.5 w-3.5 cursor-grab text-muted-foreground"
      />
      <span class="min-w-0 flex-1 truncate text-xs font-medium">
        {{ slideDisplayName(slide, index) }}
      </span>
      <div
        class="flex opacity-0 transition-opacity group-hover:opacity-100"
      >
        <Button
          variant="ghost"
          size="icon"
          class="h-6 w-6"
          title="Duplicate slide"
          @click.stop="emit('duplicate', slide.id)"
        >
          <Copy />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          class="h-6 w-6 text-destructive"
          title="Delete slide"
          @click.stop="emit('remove', slide.id)"
        >
          <Trash2 />
        </Button>
      </div>
      <span class="text-[10px] text-muted-foreground">{{ index + 1 }}</span>
    </div>
  </article>
  <Teleport to="body">
    <div
      v-if="showHoverPreview"
      data-slide-hover-preview
      class="pointer-events-none fixed z-[70] h-[170px] w-[300px] overflow-hidden rounded-lg border border-border bg-card p-2 shadow-2xl"
      :style="{
        left: `${hoverPosition.left}px`,
        top: `${hoverPosition.top}px`,
      }"
    >
      <PreviewStage :project="project" :slide="slide" compact />
    </div>
  </Teleport>
</template>
