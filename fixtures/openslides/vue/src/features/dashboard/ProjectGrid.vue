<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from "vue";
import { useVirtualizer } from "@tanstack/vue-virtual";
import { Layers3, Ungroup, X } from "lucide-vue-next";
import type { GroupChunk } from "$lib/lib/grouping";
import { chunkConsecutive } from "$lib/lib/grouping";
import { findSingleMemberGroups } from "$lib/lib/stacking";
import {
  stackProjectsMutation,
  unstackProjectsMutation,
} from "$lib/queries/stacks";
import type { ProjectSummary } from "$lib/types";
import Button from "$lib/ui/Button.vue";
import ProjectCard from "./ProjectCard.vue";

const props = defineProps<{ projects: ProjectSummary[] }>();
const emit = defineEmits<{
  open: [id: string];
  rename: [id: string, name: string];
  duplicate: [id: string];
  export: [id: string];
  remove: [id: string, name: string];
}>();

const scrollElement = ref<HTMLDivElement | null>(null);
const columnCount = ref(3);
const expanded = ref<GroupChunk<ProjectSummary> | null>(null);
const dragging = ref<{
  chunk: GroupChunk<ProjectSummary>;
  startX: number;
  startY: number;
  active: boolean;
} | null>(null);
const hoverChunkId = ref<string | null>(null);
let suppressClick = false;

const stackMutation = stackProjectsMutation();
const unstackMutation = unstackProjectsMutation();
const chunks = computed(() => chunkConsecutive(props.projects));
const rowCount = computed(() =>
  Math.ceil(chunks.value.length / columnCount.value),
);
const virtualizer = useVirtualizer(
  computed(() => ({
    count: rowCount.value,
    getScrollElement: () => scrollElement.value,
    estimateSize: () => 226,
    overscan: 5,
  })),
);
const virtualRows = computed(() => virtualizer.value.getVirtualItems());
const totalHeight = computed(() => virtualizer.value.getTotalSize());

function chunkId(chunk: GroupChunk<ProjectSummary>) {
  return chunk.kind === "stack" && chunk.groupId
    ? chunk.groupId
    : chunk.items[0]!.id;
}

function updateColumns() {
  columnCount.value =
    window.innerWidth < 768 ? 1 : window.innerWidth < 1024 ? 2 : 3;
}

function pointerDown(
  event: PointerEvent,
  chunk: GroupChunk<ProjectSummary>,
) {
  if ((event.target as HTMLElement).closest("button, input, textarea")) return;
  dragging.value = {
    chunk,
    startX: event.clientX,
    startY: event.clientY,
    active: false,
  };
}

function pointerMove(event: PointerEvent) {
  const session = dragging.value;
  if (!session) return;
  if (
    !session.active &&
    Math.hypot(
      event.clientX - session.startX,
      event.clientY - session.startY,
    ) > 8
  ) {
    session.active = true;
    suppressClick = true;
  }
  if (!session.active) return;
  const target = document
    .elementFromPoint(event.clientX, event.clientY)
    ?.closest<HTMLElement>("[data-chunk-id]");
  hoverChunkId.value = target?.dataset.chunkId ?? null;
}

function pointerUp() {
  const session = dragging.value;
  const targetChunkId = hoverChunkId.value;
  dragging.value = null;
  hoverChunkId.value = null;
  if (!session?.active || !targetChunkId) return;
  const sourceChunkId = chunkId(session.chunk);
  const targetChunk = chunks.value.find(
    (chunk) => chunkId(chunk) === targetChunkId,
  );
  const sourceIds = session.chunk.items.map((project) => project.id);
  const targetId = targetChunk?.items[0]?.id;
  if (
    targetId &&
    sourceChunkId !== targetChunkId &&
    !sourceIds.includes(targetId)
  ) {
    stackMutation.mutate({ sourceIds, targetId });
  }
  window.setTimeout(() => (suppressClick = false), 0);
}

function openProject(id: string) {
  if (!suppressClick) emit("open", id);
}

function ungroup(chunk: GroupChunk<ProjectSummary>) {
  unstackMutation.mutate(chunk.items.map((project) => project.id));
  expanded.value = null;
}

watch(
  () => props.projects,
  (projects) => {
    for (const ids of findSingleMemberGroups(
      projects,
      (project) => project.groupId,
      (project) => project.id,
    )) {
      unstackMutation.mutate(ids);
    }
  },
  { immediate: true },
);

onMounted(() => {
  updateColumns();
  window.addEventListener("resize", updateColumns);
  window.addEventListener("pointermove", pointerMove);
  window.addEventListener("pointerup", pointerUp);
});
onBeforeUnmount(() => {
  window.removeEventListener("resize", updateColumns);
  window.removeEventListener("pointermove", pointerMove);
  window.removeEventListener("pointerup", pointerUp);
});
</script>

<template>
  <div ref="scrollElement" class="flex-1 overflow-auto">
    <div class="mx-auto max-w-7xl px-6 py-8 pb-12">
      <div class="mb-8">
        <h1 class="text-3xl font-bold tracking-tight">Your Presentations</h1>
        <p class="mt-1 text-sm text-muted-foreground">
          Create beautiful code presentations on your desktop
        </p>
      </div>
      <div
        class="relative w-full"
        :style="{ height: `${totalHeight}px` }"
      >
        <div
          v-for="row in virtualRows"
          :key="String(row.key)"
          class="absolute top-0 left-0 grid w-full gap-4"
          :style="{
            height: `${row.size}px`,
            transform: `translateY(${row.start}px)`,
            gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
          }"
        >
          <div
            v-for="chunk in chunks.slice(
              row.index * columnCount,
              row.index * columnCount + columnCount,
            )"
            :key="chunkId(chunk)"
            :data-chunk-id="chunkId(chunk)"
            class="relative touch-pan-y rounded-xl transition"
            :class="{
              'scale-[1.02] bg-primary/10 ring-2 ring-primary':
                hoverChunkId === chunkId(chunk),
              'scale-95 opacity-40':
                dragging?.active &&
                chunkId(dragging.chunk) === chunkId(chunk),
            }"
            @pointerdown="pointerDown($event, chunk)"
          >
            <ProjectCard
              :project="chunk.items[0]!"
              @open="openProject"
              @rename="(id, name) => emit('rename', id, name)"
              @duplicate="emit('duplicate', $event)"
              @export="emit('export', $event)"
              @remove="(id, name) => emit('remove', id, name)"
            />
            <button
              v-if="chunk.kind === 'stack' && chunk.items.length > 1"
              type="button"
              class="absolute right-3 bottom-3 z-30 flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground shadow-lg"
              :aria-label="`Stack of ${chunk.items.length} presentations, press Enter to expand`"
              @click.stop="expanded = chunk"
            >
              <Layers3 class="h-3.5 w-3.5" />
              {{ chunk.items.length }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <Teleport to="body">
    <div
      v-if="expanded"
      class="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 p-16 backdrop-blur-sm"
      @click.self="expanded = null"
    >
      <div class="relative w-full max-w-5xl">
        <div class="absolute -top-12 right-0 flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            title="Ungroup all"
            @click="ungroup(expanded)"
          >
            <Ungroup />Ungroup all
          </Button>
          <Button
            variant="secondary"
            size="icon"
            title="Close spread"
            @click="expanded = null"
          >
            <X />
          </Button>
        </div>
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ProjectCard
            v-for="project in expanded.items"
            :key="project.id"
            :project="project"
            @open="
              expanded = null;
              emit('open', $event);
            "
            @rename="(id, name) => emit('rename', id, name)"
            @duplicate="emit('duplicate', $event)"
            @export="emit('export', $event)"
            @remove="(id, name) => emit('remove', id, name)"
          />
        </div>
      </div>
    </div>
  </Teleport>
</template>
