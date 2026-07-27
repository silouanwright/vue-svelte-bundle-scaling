<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from "vue";
import { useRoute, useRouter } from "vue-router";
import { Pane, Splitpanes } from "splitpanes";
import { VueDraggable } from "vue-draggable-plus";
import "splitpanes/dist/splitpanes.css";
import {
  ArrowLeftToLine,
  ArrowDown,
  ArrowRightToLine,
  ArrowUp,
  ChevronLeft,
  Command,
  Highlighter,
  Layers3,
  MonitorPlay,
  Moon,
  Plus,
  Settings,
  Sun,
  Trash2,
  X,
} from "lucide-vue-next";
import type { Highlight, Project, Slide } from "$lib/types";
import { HIGHLIGHT_DEFAULTS, resolveProjectLanguage } from "$lib/types";
import {
  createSlideMutation,
  createProjectMutation,
  deleteSlideMutation,
  duplicateSlideMutation,
  exportProjectMutation,
  projectQuery,
  reorderSlidesMutation,
  renameProjectMutation,
  updateProjectSettingsMutation,
  updateProjectThemeMutation,
  updateSlideSettingsMutation,
} from "$lib/queries";
import {
  stackSlidesMutation,
  unstackSlidesMutation,
} from "$lib/queries/stacks";
import { projectKeys } from "$lib/queries/keys";
import { queryClient } from "$lib/queries/query-client";
import { setWindowTitle } from "$lib/lib/window-title";
import {
  emitRedo,
  emitUndo,
  onOpenSearch,
} from "$lib/lib/app-events";
import { useAppMenu } from "$lib/lib/use-app-menu";
import {
  clearPendingSave,
  enqueueCodeSave,
  markSavePending,
} from "$lib/lib/code-save";
import { setLocalCode } from "$lib/stores/slide-code";
import {
  setIsCommandOpen,
  setIsShortcutsOpen,
  setIsSettingsOpen,
  toggleZenMode,
  toggleTheme,
  ui,
} from "$lib/stores/ui-state";
import Button from "$lib/ui/Button.vue";
import ConfirmDialog from "$lib/ui/ConfirmDialog.vue";
import EmptyState from "$lib/ui/EmptyState.vue";
import AsyncState from "$lib/components/AsyncState.vue";
import TitleBar from "$lib/components/TitleBar.vue";
import CodeEditor from "./CodeEditor.vue";
import PreviewStage from "@/features/preview/PreviewStage.vue";
import SlideCard from "@/features/slides/SlideCard.vue";
import SettingsDrawer from "@/features/settings/SettingsDrawer.vue";
import PresentOverlay from "@/features/presentation/PresentOverlay.vue";
import SlideSearchDialog from "@/features/slides/SlideSearchDialog.vue";
import SlideInspector from "./SlideInspector.vue";
import HighlightSettings from "@/features/highlights/HighlightSettings.vue";

const route = useRoute();
const router = useRouter();
const projectId = computed(() => String(route.params.projectId ?? ""));
const detailQuery = projectQuery(projectId.value);
const project = computed(() => detailQuery.data.value);
const currentSlideId = ref<string | null>(null);
const highlightIndex = ref(-1);
const pendingSelection = ref<{
  start: number;
  end: number;
  startLine: number;
  endLine: number;
} | null>(null);
const presenting = ref(false);
const searchOpen = ref(false);
const orderedSlides = ref<Slide[]>([]);
const saveStatus = ref<"idle" | "saving" | "saved" | "error">("idle");
const selectedSlideIds = ref(new Set<string>());
const selectionMode = ref(false);
const contextMenu = ref<{
  slide: Slide;
  x: number;
  y: number;
} | null>(null);
const expandedSectionId = ref<string | null>(null);
const confirmBulkDelete = ref(false);
let saveTimer: ReturnType<typeof setTimeout> | undefined;
let removeSearchListener: (() => void) | undefined;

const createSlide = createSlideMutation(projectId.value);
const createProject = createProjectMutation();
const deleteSlide = deleteSlideMutation(projectId.value);
const duplicateSlide = duplicateSlideMutation(projectId.value);
const exportProject = exportProjectMutation();
const reorderSlides = reorderSlidesMutation(projectId.value);
const updateSlide = updateSlideSettingsMutation(projectId.value);
const updateSettings = updateProjectSettingsMutation(projectId.value);
const updateTheme = updateProjectThemeMutation(projectId.value);
const renameProject = renameProjectMutation();
const stackSlides = stackSlidesMutation(projectId.value);
const unstackSlides = unstackSlidesMutation(projectId.value);

const currentSlide = computed(() => {
  const slides = project.value?.slides ?? [];
  return (
    slides.find((slide) => slide.id === currentSlideId.value) ??
    slides[0] ??
    null
  );
});
const sectionGroups = computed(() => {
  const groups = new Map<string, Slide[]>();
  for (const slide of orderedSlides.value) {
    const sectionId = slide.sectionId?.trim();
    if (!sectionId) continue;
    const group = groups.get(sectionId) ?? [];
    group.push(slide);
    groups.set(sectionId, group);
  }
  return groups;
});
const collapsedSlideIds = computed(() => {
  const ids = new Set<string>();
  for (const [sectionId, slides] of sectionGroups.value) {
    if (expandedSectionId.value === sectionId) continue;
    slides.slice(1).forEach((slide) => ids.add(slide.id));
  }
  return ids;
});

watch(
  project,
  (value) => {
    if (!value) return;
    orderedSlides.value = [...value.slides];
    if (!currentSlideId.value || !value.slides.some((s) => s.id === currentSlideId.value)) {
      currentSlideId.value =
        value.settings.currentSlideId ?? value.slides[0]?.id ?? null;
    }
    setWindowTitle(`${value.name} — OpenSlides`);
  },
  { immediate: true },
);

function patchProject(updater: (project: Project) => Project) {
  queryClient.setQueryData<Project>(projectKeys.detail(projectId.value), (old) =>
    old ? updater(old) : old,
  );
}

function changeCode(code: string) {
  const slide = currentSlide.value;
  if (!slide) return;
  setLocalCode(slide.id, code);
  patchProject((value) => ({
    ...value,
    slides: value.slides.map((entry) =>
      entry.id === slide.id ? { ...entry, code, thumbnailHtml: "" } : entry,
    ),
  }));
  saveStatus.value = "saving";
  markSavePending(slide.id, code);
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    try {
      await enqueueCodeSave(slide.id, code);
      clearPendingSave(slide.id, code);
      saveStatus.value = "saved";
      setTimeout(() => (saveStatus.value = "idle"), 1200);
    } catch {
      saveStatus.value = "error";
    }
  }, 300);
}

function addHighlight() {
  const slide = currentSlide.value;
  const selection = pendingSelection.value;
  if (!slide || !selection) return;
  const lines = slide.code.split("\n");
  const startChar =
    selection.start -
    lines
      .slice(0, selection.startLine)
      .reduce((length, line) => length + line.length + 1, 0);
  const endChar =
    selection.end -
    lines
      .slice(0, selection.endLine)
      .reduce((length, line) => length + line.length + 1, 0);
  const highlight: Highlight = {
    id: crypto.randomUUID(),
    startLine: selection.startLine,
    startChar,
    endLine: selection.endLine,
    endChar,
    ...HIGHLIGHT_DEFAULTS,
  };
  const highlights = [...slide.highlights, highlight];
  updateSlide.mutate({ slideId: slide.id, payload: { highlights } });
  pendingSelection.value = null;
  highlightIndex.value = highlights.length - 1;
}

function removeHighlight(id: string) {
  const slide = currentSlide.value;
  if (!slide) return;
  const highlights = slide.highlights.filter((highlight) => highlight.id !== id);
  updateSlide.mutate({ slideId: slide.id, payload: { highlights } });
  highlightIndex.value = Math.min(highlightIndex.value, highlights.length - 1);
}

function moveHighlight(id: string, direction: -1 | 1) {
  const slide = currentSlide.value;
  if (!slide) return;
  const from = slide.highlights.findIndex((highlight) => highlight.id === id);
  const to = from + direction;
  if (from < 0 || to < 0 || to >= slide.highlights.length) return;
  const highlights = [...slide.highlights];
  const [highlight] = highlights.splice(from, 1);
  if (!highlight) return;
  highlights.splice(to, 0, highlight);
  updateSlide.mutate({ slideId: slide.id, payload: { highlights } });
  if (highlightIndex.value === from) highlightIndex.value = to;
  else if (highlightIndex.value === to) highlightIndex.value = from;
}

function updateActiveHighlight(patch: Partial<Highlight>) {
  const slide = currentSlide.value;
  const index = highlightIndex.value;
  if (!slide || index < 0 || !slide.highlights[index]) return;
  const highlights = slide.highlights.map((highlight, itemIndex) =>
    itemIndex === index ? { ...highlight, ...patch } : highlight,
  );
  updateSlide.mutate({ slideId: slide.id, payload: { highlights } });
}

function onReorder() {
  const ids = orderedSlides.value.map((slide) => slide.id);
  patchProject((value) => ({ ...value, slides: [...orderedSlides.value] }));
  reorderSlides.mutate(ids);
}

function selectSlide(id: string, event?: MouseEvent) {
  if (selectionMode.value || event?.metaKey || event?.ctrlKey) {
    selectionMode.value = true;
    const selected = new Set(selectedSlideIds.value);
    if (selected.has(id)) selected.delete(id);
    else selected.add(id);
    selectedSlideIds.value = selected;
    if (!selected.size) selectionMode.value = false;
    return;
  }
  selectedSlideIds.value = new Set();
  currentSlideId.value = id;
  highlightIndex.value = -1;
}

function openSlideContext(slide: Slide, event: MouseEvent) {
  contextMenu.value = { slide, x: event.clientX, y: event.clientY };
}

function startSelection(all = false) {
  const ids = all
    ? orderedSlides.value.map((slide) => slide.id)
    : contextMenu.value
      ? [contextMenu.value.slide.id]
      : [];
  selectedSlideIds.value = new Set(ids);
  selectionMode.value = ids.length > 0;
  contextMenu.value = null;
}

function clearSelection() {
  selectedSlideIds.value = new Set();
  selectionMode.value = false;
  contextMenu.value = null;
}

function selectedInOrder() {
  return orderedSlides.value.filter((slide) =>
    selectedSlideIds.value.has(slide.id),
  );
}

function moveSelected(destination: "start" | "end") {
  const selected = selectedInOrder();
  if (!selected.length) return;
  const remaining = orderedSlides.value.filter(
    (slide) => !selectedSlideIds.value.has(slide.id),
  );
  orderedSlides.value =
    destination === "start"
      ? [...selected, ...remaining]
      : [...remaining, ...selected];
  onReorder();
}

function groupSelected() {
  const selected = selectedInOrder();
  if (selected.length < 2) return;
  stackSlides.mutate({
    sourceIds: selected.slice(1).map((slide) => slide.id),
    targetId: selected[0]!.id,
  });
}

function ungroupSection(sectionId: string) {
  const ids = sectionGroups.value
    .get(sectionId)
    ?.map((slide) => slide.id) ?? [];
  if (ids.length) unstackSlides.mutate(ids);
  expandedSectionId.value = null;
}

async function deleteSelected() {
  const selected = selectedInOrder();
  confirmBulkDelete.value = false;
  if (!selected.length || selected.length >= orderedSlides.value.length) return;
  for (const slide of selected) {
    await deleteSlide.mutateAsync(slide.id);
  }
  clearSelection();
  await detailQuery.refetch();
}

async function addSlide() {
  const slide = await createSlide.mutateAsync({
    code: currentSlide.value?.code ?? "",
  });
  await detailQuery.refetch();
  currentSlideId.value = slide.id;
}

function keydown(event: KeyboardEvent) {
  if (event.key === "Escape" && ui.isZenMode) {
    event.preventDefault();
    toggleZenMode();
    return;
  }
  if (event.key === "Escape" && selectionMode.value) {
    event.preventDefault();
    clearSelection();
  }
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    setIsCommandOpen(true);
  }
  if ((event.metaKey || event.ctrlKey) && event.key === ",") {
    event.preventDefault();
    setIsSettingsOpen(true);
  }
  if (
    (event.metaKey || event.ctrlKey) &&
    event.shiftKey &&
    event.key.toLowerCase() === "p"
  ) {
    event.preventDefault();
    presenting.value = true;
  }
}

function presentFromCommand() {
  presenting.value = true;
}
function searchFromCommand() {
  searchOpen.value = true;
}

useAppMenu({
  "menu://new-project": () => {
    void createProject.mutateAsync("Untitled Presentation").then((created) => {
      void router.push({ name: "editor", params: { projectId: created.id } });
    });
  },
  "menu://open-dashboard": () => void router.push({ name: "dashboard" }),
  "menu://export": () => exportProject.mutate(projectId.value),
  "menu://present": () => (presenting.value = true),
  "menu://zen": toggleZenMode,
  "menu://settings": () => setIsSettingsOpen(true),
  "menu://command-palette": () => setIsCommandOpen(true),
  "menu://add-slide": () => void addSlide(),
  "menu://duplicate-slide": () => {
    if (currentSlide.value) duplicateSlide.mutate(currentSlide.value.id);
  },
  "menu://toggle-theme": toggleTheme,
  "menu://shortcuts-app": () => setIsShortcutsOpen(true),
  "menu://shortcuts-help": () => setIsShortcutsOpen(true),
  "menu://undo": emitUndo,
  "menu://redo": emitRedo,
});

onMounted(() => {
  window.addEventListener("keydown", keydown);
  window.addEventListener("openslides:present", presentFromCommand);
  removeSearchListener = onOpenSearch(searchFromCommand);
});
onBeforeUnmount(() => {
  window.removeEventListener("keydown", keydown);
  window.removeEventListener("openslides:present", presentFromCommand);
  removeSearchListener?.();
  if (saveTimer) clearTimeout(saveTimer);
});
</script>

<template>
  <AsyncState
    :is-loading="detailQuery.isLoading.value"
    :is-error="detailQuery.isError.value"
    :error="(detailQuery.error.value as Error | null)"
    loading-label="Loading presentation…"
  >
    <div v-if="project" class="flex h-full flex-col overflow-hidden bg-background">
      <TitleBar v-if="!ui.isZenMode" :title="project.name">
        <template #leading>
          <Button
            variant="ghost"
            size="icon"
            title="Back to presentations"
            @click="router.push({ name: 'dashboard' })"
          >
            <ChevronLeft />
          </Button>
          <input
            :value="project.name"
            class="w-56 truncate rounded border border-transparent bg-transparent px-2 py-1 text-sm font-medium hover:border-border focus:border-input focus:outline-none"
            aria-label="Presentation name"
            @change="
              renameProject.mutate({
                projectId,
                name: ($event.currentTarget as HTMLInputElement).value,
              })
            "
          />
        </template>
        <template #trailing>
          <Button
            variant="ghost"
            size="icon"
            title="Command palette"
            @click="setIsCommandOpen(true)"
          >
            <Command />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title="Toggle application theme"
            @click="toggleTheme"
          >
            <Sun v-if="ui.isDarkUi" />
            <Moon v-else />
          </Button>
          <Button
            variant="outline"
            size="sm"
            @click="setIsSettingsOpen(true)"
          >
            <Settings />Settings
          </Button>
          <Button
            size="sm"
            :disabled="project.slides.length === 0"
            @click="presenting = true"
          >
            <MonitorPlay />Present
          </Button>
        </template>
      </TitleBar>

      <div v-if="ui.isZenMode && currentSlide" class="relative min-h-0 flex-1">
        <PreviewStage
          :project="project"
          :slide="currentSlide"
          :highlight-index="highlightIndex"
        />
        <button
          type="button"
          class="absolute top-3 right-3 z-30 rounded-md bg-card/80 px-2 py-1 text-[11px] text-muted-foreground shadow backdrop-blur hover:text-foreground"
          @click="toggleZenMode"
        >
          Exit Focus (Esc)
        </button>
      </div>

      <EmptyState
        v-else-if="!currentSlide"
        :icon="MonitorPlay"
        title="This presentation has no slides"
        description="Add a slide to begin writing and presenting code."
        class="m-6 flex-1"
      >
        <Button @click="addSlide"><Plus />Add slide</Button>
      </EmptyState>

      <Splitpanes v-else horizontal class="min-h-0 flex-1">
        <Pane :size="78" :min-size="45">
          <Splitpanes class="h-full">
            <Pane :size="42" :min-size="18">
              <div class="flex h-full flex-col">
                <SlideInspector
                  :slide="currentSlide"
                  @update="
                    updateSlide.mutate({
                      slideId: currentSlide.id,
                      payload: $event,
                    })
                  "
                />
                <div class="min-h-0 flex-1">
                  <CodeEditor
                    :slide="currentSlide"
                    :language="resolveProjectLanguage(project)"
                    :theme="project.theme"
                    :font-size="project.settings.editorFontSize"
                    :show-line-numbers="ui.editorShowLineNumbers"
                    :save-status="saveStatus"
                    @change="changeCode"
                    @selection="pendingSelection = $event"
                  />
                </div>
              </div>
            </Pane>
            <Pane :size="58" :min-size="25">
              <div class="flex h-full min-w-0">
                <div class="min-w-0 flex-1">
                  <PreviewStage
                    :project="project"
                    :slide="currentSlide"
                    :highlight-index="highlightIndex"
                  />
                </div>
                <aside
                  class="w-56 shrink-0 overflow-y-auto border-l border-border/50 bg-card/70 p-3"
                >
                  <div class="mb-3 flex items-center justify-between">
                    <h3 class="flex items-center gap-1.5 text-xs font-semibold">
                      <Highlighter class="h-3.5 w-3.5" />Highlights
                    </h3>
                    <Button
                      size="sm"
                      class="h-7 px-2"
                      :disabled="!pendingSelection"
                      @click="addHighlight"
                    >
                      <Plus />Add
                    </Button>
                  </div>
                  <p
                    v-if="pendingSelection"
                    class="mb-3 rounded-md bg-primary/10 p-2 text-[10px] text-primary"
                  >
                    Lines {{ pendingSelection.startLine + 1 }}–{{
                      pendingSelection.endLine + 1
                    }}
                    selected
                  </p>
                  <button
                    class="mb-1 w-full rounded-md px-2 py-1.5 text-left text-xs"
                    :class="
                      highlightIndex === -1
                        ? 'bg-accent text-accent-foreground'
                        : 'hover:bg-muted'
                    "
                    @click="highlightIndex = -1"
                  >
                    Clean slide
                  </button>
                  <div
                    v-for="(highlight, index) in currentSlide.highlights"
                    :key="highlight.id"
                    :data-highlight-id="highlight.id"
                    class="group mb-1 flex items-center rounded-md"
                    :class="
                      highlightIndex === index
                        ? 'bg-accent text-accent-foreground'
                        : 'hover:bg-muted'
                    "
                  >
                    <button
                      data-highlight-select
                      class="min-w-0 flex-1 px-2 py-1.5 text-left text-xs"
                      @click="highlightIndex = index"
                    >
                      Step {{ index + 1 }} · lines
                      {{ highlight.startLine + 1 }}–{{ highlight.endLine + 1 }}
                    </button>
                    <Button
                      variant="ghost"
                      size="icon"
                      class="h-6 w-6"
                      :disabled="index === 0"
                      aria-label="Move highlight up"
                      @click="moveHighlight(highlight.id, -1)"
                    >
                      <ArrowUp />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      class="h-6 w-6"
                      :disabled="index === currentSlide.highlights.length - 1"
                      aria-label="Move highlight down"
                      @click="moveHighlight(highlight.id, 1)"
                    >
                      <ArrowDown />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      class="h-6 w-6 opacity-0 group-hover:opacity-100"
                      aria-label="Delete highlight"
                      @click="removeHighlight(highlight.id)"
                    >
                      <Trash2 />
                    </Button>
                  </div>
                  <HighlightSettings
                    v-if="highlightIndex >= 0 && currentSlide.highlights[highlightIndex]"
                    :highlight="currentSlide.highlights[highlightIndex]!"
                    :disabled="project.settings.useGlobalHighlight"
                    @update="updateActiveHighlight"
                  />
                </aside>
              </div>
            </Pane>
          </Splitpanes>
        </Pane>
        <Pane :size="22" :min-size="14" :max-size="38">
          <section class="flex h-full flex-col border-t border-border/60 bg-card/45">
            <header class="flex h-9 shrink-0 items-center justify-between px-3">
              <span class="text-xs font-semibold">
                Slides · {{ project.slides.length }}
              </span>
              <Button size="sm" class="h-7" @click="addSlide">
                <Plus />Add slide
              </Button>
            </header>
            <VueDraggable
              v-model="orderedSlides"
              handle=".drag-handle"
              class="flex min-h-0 flex-1 gap-3 overflow-x-auto px-3 pb-3"
              @end="onReorder"
            >
              <div
                v-for="(slide, index) in orderedSlides"
                v-show="!collapsedSlideIds.has(slide.id)"
                :key="slide.id"
                class="relative flex shrink-0 items-center gap-2"
              >
                <div
                  v-if="
                    slide.sectionId &&
                    expandedSectionId === slide.sectionId &&
                    sectionGroups.get(slide.sectionId)?.[0]?.id === slide.id
                  "
                  class="flex shrink-0 flex-col gap-1 self-center border-r border-border/60 pr-2"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    title="Ungroup slide section"
                    @click="ungroupSection(slide.sectionId!)"
                  >
                    Ungroup
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Collapse section fan"
                    @click="expandedSectionId = null"
                  >
                    <X />
                  </Button>
                </div>
                <SlideCard
                  :project="project"
                  :slide="slide"
                  :index="index"
                  :active="slide.id === currentSlide.id"
                  :multi-selected="selectedSlideIds.has(slide.id)"
                  @select="selectSlide"
                  @context="openSlideContext"
                  @duplicate="duplicateSlide.mutate($event)"
                  @remove="
                    deleteSlide.mutate($event, {
                      onSuccess: () => detailQuery.refetch(),
                    })
                  "
                />
                <button
                  v-if="
                    slide.sectionId &&
                    sectionGroups.get(slide.sectionId)?.[0]?.id === slide.id &&
                    (sectionGroups.get(slide.sectionId)?.length ?? 0) > 1
                  "
                  type="button"
                  class="absolute right-2 bottom-2 z-20 rounded-full bg-primary px-2 py-1 text-[10px] font-semibold text-primary-foreground shadow"
                  :aria-label="`Stack of ${sectionGroups.get(slide.sectionId)?.length}, press Enter to expand`"
                  @click="
                    expandedSectionId =
                      expandedSectionId === slide.sectionId
                        ? null
                        : slide.sectionId!
                  "
                >
                  {{ sectionGroups.get(slide.sectionId)?.length }}
                </button>
              </div>
            </VueDraggable>
          </section>
        </Pane>
      </Splitpanes>

      <SettingsDrawer
        :open="ui.isSettingsOpen"
        :project="project"
        @close="setIsSettingsOpen(false)"
        @settings="updateSettings.mutate"
        @theme="updateTheme.mutate"
      />
      <PresentOverlay
        v-if="presenting && currentSlide"
        :project="project"
        :initial-slide-id="currentSlide.id"
        @close="presenting = false"
      />
      <SlideSearchDialog
        :open="searchOpen"
        :project="project"
        @close="searchOpen = false"
        @select="
          currentSlideId = $event;
          highlightIndex = -1;
        "
      />
      <Teleport to="body">
        <div
          v-if="contextMenu"
          class="fixed z-[90] min-w-[210px] overflow-hidden rounded-lg border border-border bg-card py-1 shadow-xl"
          :style="{ left: `${contextMenu.x}px`, top: `${contextMenu.y}px` }"
          role="menu"
          aria-label="Slide actions"
        >
          <button
            class="block w-full px-3 py-2 text-left text-sm hover:bg-muted"
            @click="
              currentSlideId = contextMenu!.slide.id;
              contextMenu = null;
            "
          >
            Rename
          </button>
          <button
            class="block w-full px-3 py-2 text-left text-sm hover:bg-muted"
            @click="startSelection(true)"
          >
            Select all slides
          </button>
          <button
            class="block w-full px-3 py-2 text-left text-sm hover:bg-muted"
            @click="startSelection(false)"
          >
            Select multiple
          </button>
        </div>
        <div
          v-if="selectionMode"
          class="fixed right-[18px] bottom-[18px] z-[90] flex items-center gap-1 rounded-full border border-border bg-card/95 p-1.5 shadow-xl backdrop-blur"
          role="toolbar"
          aria-label="Selected slide actions"
        >
          <span class="min-w-8 px-1 text-center text-xs font-semibold">
            {{ selectedSlideIds.size }}
          </span>
          <Button
            variant="ghost"
            size="icon"
            title="Move selected to start"
            @click="moveSelected('start')"
          >
            <ArrowLeftToLine />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title="Move selected to end"
            @click="moveSelected('end')"
          >
            <ArrowRightToLine />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title="Group selected"
            :disabled="selectedSlideIds.size < 2"
            @click="groupSelected"
          >
            <Layers3 />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title="Delete selected"
            :disabled="
              selectedSlideIds.size === 0 ||
              selectedSlideIds.size === orderedSlides.length
            "
            @click="confirmBulkDelete = true"
          >
            <Trash2 />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title="Cancel selection (Esc)"
            @click="clearSelection"
          >
            <X />
          </Button>
        </div>
      </Teleport>
      <ConfirmDialog
        :open="confirmBulkDelete"
        :title="`Delete ${selectedSlideIds.size} selected slides?`"
        description="This cannot be undone."
        @confirm="deleteSelected"
        @cancel="confirmBulkDelete = false"
      />
    </div>
  </AsyncState>
</template>

<style>
.splitpanes__splitter {
  background: color-mix(in srgb, var(--border) 65%, transparent);
  position: relative;
}
.splitpanes--vertical > .splitpanes__splitter {
  width: 4px;
}
.splitpanes--horizontal > .splitpanes__splitter {
  height: 4px;
}
</style>
