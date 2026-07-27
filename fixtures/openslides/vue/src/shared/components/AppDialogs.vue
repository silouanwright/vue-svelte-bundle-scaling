<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  Command,
  Home,
  Keyboard,
  MonitorPlay,
  Moon,
  Plus,
  Search,
  Settings,
  Sun,
} from "lucide-vue-next";
import { SHORTCUTS } from "$lib/lib/shortcuts";
import { emitOpenSearch } from "$lib/lib/app-events";
import {
  setIsCommandOpen,
  setIsSettingsOpen,
  setIsShortcutsOpen,
  toggleTheme,
  ui,
} from "$lib/stores/ui-state";
import Overlay, { Z_INDEX } from "$lib/ui/Overlay.vue";

const router = useRouter();
const route = useRoute();
const query = ref("");
const input = ref<HTMLInputElement | null>(null);
const commands = computed(() =>
  [
    {
      label: "Go to presentations",
      icon: Home,
      show: route.name !== "dashboard",
      run: () => router.push({ name: "dashboard" }),
    },
    {
      label: "New presentation",
      icon: Plus,
      show: true,
      run: () => {
        void router.push({ name: "dashboard" });
        window.dispatchEvent(new CustomEvent("openslides:new-project"));
      },
    },
    {
      label: "Search slides",
      icon: Search,
      show: route.name === "editor",
      run: emitOpenSearch,
    },
    {
      label: "Presentation settings",
      icon: Settings,
      show: route.name === "editor",
      run: () => setIsSettingsOpen(true),
    },
    {
      label: "Start presentation",
      icon: MonitorPlay,
      show: route.name === "editor",
      run: () => window.dispatchEvent(new CustomEvent("openslides:present")),
    },
    {
      label: ui.isDarkUi ? "Use light interface" : "Use dark interface",
      icon: ui.isDarkUi ? Sun : Moon,
      show: true,
      run: toggleTheme,
    },
    {
      label: "Keyboard shortcuts",
      icon: Keyboard,
      show: true,
      run: () => setIsShortcutsOpen(true),
    },
  ]
    .filter((command) => command.show)
    .filter((command) =>
      command.label.toLowerCase().includes(query.value.toLowerCase()),
    ),
);

watch(
  () => ui.isCommandOpen,
  async (open) => {
    if (!open) return;
    query.value = "";
    await nextTick();
    input.value?.focus();
  },
);

function run(command: (typeof commands.value)[number]) {
  setIsCommandOpen(false);
  command.run();
}

function keyLabel(key: string) {
  if (key === "mod") return navigator.platform.includes("Mac") ? "⌘" : "Ctrl";
  return key;
}
</script>

<template>
  <Overlay
    v-if="ui.isCommandOpen"
    :z="Z_INDEX.command"
    placement="top"
    close-on-esc
    class="w-full max-w-xl"
    @close="setIsCommandOpen(false)"
  >
    <div
      class="overflow-hidden rounded-xl border bg-card shadow-2xl"
      role="dialog"
      aria-label="Command palette"
    >
      <div class="flex items-center gap-3 border-b px-4">
        <Command class="h-4 w-4 text-muted-foreground" />
        <input
          ref="input"
          v-model="query"
          class="h-12 min-w-0 flex-1 bg-transparent text-sm outline-none"
          placeholder="Type a command…"
          @keydown.enter="commands[0] && run(commands[0])"
        />
      </div>
      <div class="max-h-80 overflow-y-auto p-2">
        <button
          v-for="command in commands"
          :key="command.label"
          class="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm hover:bg-accent"
          @click="run(command)"
        >
          <component :is="command.icon" class="h-4 w-4 text-muted-foreground" />
          {{ command.label }}
        </button>
        <p
          v-if="commands.length === 0"
          class="p-6 text-center text-sm text-muted-foreground"
        >
          No matching command
        </p>
      </div>
    </div>
  </Overlay>

  <Overlay
    v-if="ui.isShortcutsOpen"
    :z="Z_INDEX.shortcuts"
    close-on-esc
    class="w-full max-w-lg"
    @close="setIsShortcutsOpen(false)"
  >
    <div
      class="rounded-xl border bg-card p-5 shadow-2xl"
      role="dialog"
      aria-label="Keyboard shortcuts"
    >
      <div class="mb-4 flex items-center gap-2">
        <Keyboard class="h-4 w-4" />
        <h2 class="text-sm font-semibold">Keyboard shortcuts</h2>
      </div>
      <div class="grid grid-cols-2 gap-x-6 gap-y-3">
        <div
          v-for="shortcut in Object.values(SHORTCUTS)"
          :key="shortcut.description"
          class="flex items-center justify-between gap-3 text-xs"
        >
          <span class="text-muted-foreground">{{ shortcut.description }}</span>
          <span class="flex gap-1">
            <kbd
              v-for="key in shortcut.keys"
              :key="key"
              class="rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px]"
            >
              {{ keyLabel(key) }}
            </kbd>
          </span>
        </div>
      </div>
    </div>
  </Overlay>
</template>
