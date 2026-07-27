<script setup lang="ts">
import { computed, ref } from "vue";
import {
  ArrowRight,
  Copy,
  Download,
  Pencil,
  Trash2,
} from "lucide-vue-next";
import type { ProjectSummary } from "$lib/types";
import { formatRelative } from "$lib/lib/utils";
import { themeBackground } from "$lib/lib/themes";
import Button from "$lib/ui/Button.vue";
import InlineEditableText from "$lib/ui/InlineEditableText.vue";
import ProjectThumb from "./ProjectThumb.vue";

const props = defineProps<{ project: ProjectSummary }>();
const emit = defineEmits<{
  open: [id: string];
  rename: [id: string, name: string];
  duplicate: [id: string];
  export: [id: string];
  remove: [id: string, name: string];
}>();
const renaming = ref(false);
const renameValue = ref(props.project.name);
const background = computed(() => themeBackground(props.project.theme));
const topGradient = computed(
  () =>
    `linear-gradient(to bottom, ${background.value} 0%, ${background.value}e0 45%, transparent 100%)`,
);
const bottomGradient = computed(
  () =>
    `linear-gradient(to top, ${background.value} 0%, ${background.value}e0 48%, transparent 100%)`,
);

function commitRename() {
  if (renameValue.value.trim() && renameValue.value !== props.project.name) {
    emit("rename", props.project.id, renameValue.value.trim());
  }
  renaming.value = false;
}
</script>

<template>
  <article
    class="group relative h-[210px] cursor-pointer overflow-hidden rounded-xl border border-border/70 bg-card p-0 transition-all duration-200 select-none hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    role="button"
    tabindex="0"
    :aria-label="project.name"
    @click="!renaming && emit('open', project.id)"
    @keydown.enter="!renaming && emit('open', project.id)"
    @keydown.space.prevent="!renaming && emit('open', project.id)"
  >
    <ProjectThumb
      :project="project"
      :font-size="6"
      class="absolute inset-0 h-full w-full rounded-none border-0"
      code-class-name="p-3 pt-11"
    />
    <div
      class="pointer-events-none absolute inset-x-0 top-0 z-10 px-3 pt-3 pb-9"
      :style="{ background: topGradient }"
    >
      <div class="pointer-events-auto pr-24 text-white mix-blend-difference">
        <InlineEditableText
          v-if="renaming"
          v-model="renameValue"
          with-buttons
          class="h-7 text-sm font-semibold"
          @commit="commitRename"
          @cancel="renaming = false"
        />
        <template v-else>
          <h3 class="truncate text-base leading-tight font-semibold">
            {{ project.name }}
          </h3>
          <p class="mt-1 text-[11px] opacity-75">
            {{ project.slideCount }}
            {{ project.slideCount === 1 ? "slide" : "slides" }}
          </p>
        </template>
      </div>
    </div>
    <div class="absolute top-2 right-2 z-20 flex gap-0.5">
      <Button
        variant="ghost"
        size="icon"
        class="h-7 w-7 bg-black/10 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
        title="Rename"
        @click.stop="
          renameValue = project.name;
          renaming = true;
        "
      >
        <Pencil />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        class="h-7 w-7 bg-black/10 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
        title="Duplicate presentation"
        @click.stop="emit('duplicate', project.id)"
      >
        <Copy />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        class="h-7 w-7 bg-black/10 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
        title="Export"
        @click.stop="emit('export', project.id)"
      >
        <Download />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        class="h-7 w-7 bg-black/10 text-red-300 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
        title="Delete presentation"
        @click.stop="emit('remove', project.id, project.name)"
      >
        <Trash2 />
      </Button>
    </div>
    <div
      class="absolute inset-x-0 bottom-0 z-10 px-3 pt-9 pb-2.5"
      :style="{ background: bottomGradient }"
    >
      <div
        class="flex items-center justify-between text-white mix-blend-difference"
      >
        <span class="text-[11px] font-medium opacity-80">
          {{ project.theme }}
        </span>
        <span class="flex items-center gap-2 text-[11px] opacity-80">
          Updated {{ formatRelative(project.updatedAt) }}
          <ArrowRight
            class="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
          />
        </span>
      </div>
    </div>
  </article>
</template>
