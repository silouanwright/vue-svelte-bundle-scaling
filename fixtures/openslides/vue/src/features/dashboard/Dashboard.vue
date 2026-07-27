<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { Command, FolderOpen, Plus, Upload } from "lucide-vue-next";
import {
  createProjectMutation,
  deleteProjectMutation,
  duplicateProjectMutation,
  exportProjectMutation,
  importProjectMutation,
  projectsQuery,
  renameProjectMutation,
} from "$lib/queries";
import { DEFAULT_THEME } from "$lib/constants";
import { setWindowTitle } from "$lib/lib/window-title";
import { api } from "$lib/lib/tauri-api";
import { useAppMenu } from "$lib/lib/use-app-menu";
import {
  setIsCommandOpen,
  setIsShortcutsOpen,
  toggleTheme,
} from "$lib/stores/ui-state";
import Button from "$lib/ui/Button.vue";
import ConfirmDialog from "$lib/ui/ConfirmDialog.vue";
import EmptyState from "$lib/ui/EmptyState.vue";
import AsyncState from "$lib/components/AsyncState.vue";
import TitleBar from "$lib/components/TitleBar.vue";
import CreateDeckTile from "./CreateDeckTile.vue";
import ProjectGrid from "./ProjectGrid.vue";

const router = useRouter();
const listQuery = projectsQuery();
const createMutation = createProjectMutation();
const renameMutation = renameProjectMutation();
const duplicateMutation = duplicateProjectMutation();
const deleteMutation = deleteProjectMutation();
const exportMutation = exportProjectMutation();
const importMutation = importProjectMutation();
const projects = computed(() => listQuery.data.value ?? []);
const creating = ref(false);
const newName = ref("Untitled Presentation");
const selectedTheme = ref(DEFAULT_THEME);
const deleteTarget = ref<{ id: string; name: string } | null>(null);

async function createProject() {
  const project = await createMutation.mutateAsync(
    newName.value.trim() || "Untitled Presentation",
  );
  if (selectedTheme.value !== project.theme) {
    await api.updateProjectTheme(project.id, selectedTheme.value);
  }
  creating.value = false;
  newName.value = "Untitled Presentation";
  await router.push({ name: "editor", params: { projectId: project.id } });
}

async function importProject() {
  try {
    const project = await importMutation.mutateAsync();
    await router.push({ name: "editor", params: { projectId: project.id } });
  } catch {
    // The mutation owns cancellation and error reporting.
  }
}

function keydown(event: KeyboardEvent) {
  if (event.key === "?" && !(event.target instanceof HTMLInputElement)) {
    event.preventDefault();
    setIsShortcutsOpen(true);
  }
}
function openCreate() {
  creating.value = true;
}

useAppMenu({
  "menu://new-project": openCreate,
  "menu://open-dashboard": () => void router.push({ name: "dashboard" }),
  "menu://command-palette": () => setIsCommandOpen(true),
  "menu://toggle-theme": toggleTheme,
  "menu://shortcuts-app": () => setIsShortcutsOpen(true),
  "menu://shortcuts-help": () => setIsShortcutsOpen(true),
  "menu://export": () => {
    const first = projects.value[0];
    if (first) exportMutation.mutate(first.id);
  },
});

onMounted(() => {
  setWindowTitle("OpenSlides — Presentations");
  window.addEventListener("keydown", keydown);
  window.addEventListener("openslides:new-project", openCreate);
});
onBeforeUnmount(() => {
  window.removeEventListener("keydown", keydown);
  window.removeEventListener("openslides:new-project", openCreate);
});
</script>

<template>
  <div class="flex h-full flex-col bg-background">
    <TitleBar>
      <template #leading>
        <div class="flex items-center gap-2">
          <img
            src="/openslides-logo.svg"
            alt="OpenSlides"
            class="h-8 w-8 rounded-lg object-cover"
          />
          <span class="text-sm font-semibold">OpenSlides</span>
        </div>
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
          variant="outline"
          size="sm"
          :disabled="importMutation.isPending.value"
          @click="importProject"
        >
          <Upload />Import
        </Button>
        <Button size="sm" @click="creating = true">
          <Plus />New Presentation
        </Button>
      </template>
    </TitleBar>

    <div
      v-if="creating && !listQuery.isLoading.value"
      class="mx-auto w-full max-w-7xl px-6 pt-8"
    >
      <CreateDeckTile
        v-model:expanded="creating"
        v-model:name="newName"
        v-model:selected-theme="selectedTheme"
        :pending="createMutation.isPending.value"
        standalone
        @create="createProject"
      />
    </div>

    <AsyncState
      :is-loading="listQuery.isLoading.value"
      :is-error="listQuery.isError.value"
      :error="(listQuery.error.value as Error | null)"
      loading-label="Loading presentations…"
    >
      <div
        v-if="projects.length"
        class="flex min-h-0 flex-1"
      >
        <ProjectGrid
          :projects="projects"
          @open="router.push({ name: 'editor', params: { projectId: $event } })"
          @rename="
            (id, name) =>
              renameMutation.mutate({ projectId: id, name })
          "
          @duplicate="duplicateMutation.mutate"
          @export="exportMutation.mutate"
          @remove="
            (id, name) => (deleteTarget = { id, name })
          "
        />
      </div>
      <EmptyState
        v-else-if="!creating"
        :icon="FolderOpen"
        title="No presentations yet"
        description="Create your first presentation, or import an existing one."
      >
        <Button @click="creating = true"><Plus />Create Presentation</Button>
        <Button variant="outline" @click="importProject">
          <Upload />Import
        </Button>
      </EmptyState>
    </AsyncState>

    <ConfirmDialog
      :open="deleteTarget !== null"
      :title="`Delete &quot;${deleteTarget?.name ?? ''}&quot;?`"
      description="This cannot be undone."
      @confirm="
        deleteTarget &&
          deleteMutation.mutate(deleteTarget.id, {
            onSettled: () => (deleteTarget = null),
          })
      "
      @cancel="deleteTarget = null"
    />
  </div>
</template>
