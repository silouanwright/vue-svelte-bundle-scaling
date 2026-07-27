<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  X,
} from "lucide-vue-next";
import type { Project } from "$lib/types";
import Button from "$lib/ui/Button.vue";
import PreviewStage from "@/features/preview/PreviewStage.vue";
import { usePresentationFullscreen } from "./use-presentation-fullscreen";

const props = defineProps<{
  project: Project;
  initialSlideId: string;
}>();
const emit = defineEmits<{ close: [] }>();
const slideIndex = ref(
  Math.max(
    0,
    props.project.slides.findIndex((slide) => slide.id === props.initialSlideId),
  ),
);
const highlightIndex = ref(-1);
const autoPlaying = ref(false);
let timer: ReturnType<typeof setTimeout> | undefined;
const slide = computed(() => props.project.slides[slideIndex.value]!);
const progress = computed(
  () => ((slideIndex.value + 1) / props.project.slides.length) * 100,
);
usePresentationFullscreen(() => emit("close"));

function next() {
  if (highlightIndex.value < slide.value.highlights.length - 1) {
    highlightIndex.value += 1;
  } else if (slideIndex.value < props.project.slides.length - 1) {
    slideIndex.value += 1;
    highlightIndex.value = -1;
  } else {
    autoPlaying.value = false;
  }
  schedule();
}

function previous() {
  if (highlightIndex.value >= 0) {
    highlightIndex.value -= 1;
  } else if (slideIndex.value > 0) {
    slideIndex.value -= 1;
    highlightIndex.value =
      props.project.slides[slideIndex.value]!.highlights.length - 1;
  }
}

function schedule() {
  if (timer) clearTimeout(timer);
  if (!autoPlaying.value) return;
  timer = setTimeout(next, slide.value.duration);
}

function toggleAutoplay() {
  autoPlaying.value = !autoPlaying.value;
  schedule();
}

function keydown(event: KeyboardEvent) {
  if (event.key === "Escape") emit("close");
  if (["ArrowRight", " ", "Enter"].includes(event.key)) next();
  if (event.key === "ArrowLeft") previous();
}
onMounted(() => window.addEventListener("keydown", keydown));
onBeforeUnmount(() => {
  window.removeEventListener("keydown", keydown);
  if (timer) clearTimeout(timer);
});
</script>

<template>
  <div
    id="openslides-present-root"
    class="fixed inset-0 z-[100] bg-black"
    @click="next"
  >
    <PreviewStage
      :project="project"
      :slide="slide"
      :highlight-index="highlightIndex"
    />
    <div
      class="absolute inset-x-0 top-0 flex items-center justify-between p-4 opacity-0 transition-opacity hover:opacity-100"
      @click.stop
    >
      <span class="rounded-full bg-black/50 px-3 py-1 text-xs text-white">
        {{ slideIndex + 1 }} / {{ project.slides.length }}
      </span>
      <Button
        variant="secondary"
        size="icon"
        title="Exit presentation"
        @click="emit('close')"
      >
        <X />
      </Button>
    </div>
    <div
      class="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/55 p-2 text-white opacity-0 backdrop-blur transition-opacity hover:opacity-100"
      @click.stop
    >
      <Button variant="ghost" size="icon" title="Previous" @click="previous">
        <ChevronLeft />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        :title="autoPlaying ? 'Pause autoplay' : 'Play (auto-advance)'"
        @click="toggleAutoplay"
      >
        <Pause v-if="autoPlaying" />
        <Play v-else />
      </Button>
      <Button variant="ghost" size="icon" title="Next" @click="next">
        <ChevronRight />
      </Button>
    </div>
    <div class="absolute inset-x-0 bottom-0 h-1 bg-white/15">
      <div
        class="h-full bg-primary transition-[width]"
        :style="{ width: `${progress}%` }"
      />
    </div>
  </div>
</template>
