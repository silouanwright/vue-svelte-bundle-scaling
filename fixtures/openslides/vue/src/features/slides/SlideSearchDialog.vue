<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { Search } from "lucide-vue-next";
import type { Project } from "$lib/types";
import { slideDisplayName } from "$lib/types";
import Overlay, { Z_INDEX } from "$lib/ui/Overlay.vue";

const props = defineProps<{ open: boolean; project: Project }>();
const emit = defineEmits<{ close: []; select: [id: string] }>();
const query = ref("");
const input = ref<HTMLInputElement | null>(null);
const matches = computed(() => {
  const needle = query.value.trim().toLowerCase();
  if (!needle) return props.project.slides;
  return props.project.slides.filter(
    (slide, index) =>
      slideDisplayName(slide, index).toLowerCase().includes(needle) ||
      slide.code.toLowerCase().includes(needle),
  );
});

watch(
  () => props.open,
  async (open) => {
    if (!open) return;
    query.value = "";
    await nextTick();
    input.value?.focus();
  },
);

function select(id: string) {
  emit("select", id);
  emit("close");
}
</script>

<template>
  <Overlay
    v-if="open"
    :z="Z_INDEX.command"
    placement="top"
    close-on-esc
    class="w-full max-w-xl"
    @close="emit('close')"
  >
    <div class="overflow-hidden rounded-xl border bg-card shadow-2xl">
      <div class="flex items-center gap-3 border-b px-4">
        <Search class="h-4 w-4 text-muted-foreground" />
        <input
          ref="input"
          v-model="query"
          class="h-12 min-w-0 flex-1 bg-transparent text-sm outline-none"
          placeholder="Search slide names and code…"
          @keydown.enter="matches[0] && select(matches[0].id)"
        />
      </div>
      <div class="max-h-[420px] overflow-y-auto p-2">
        <button
          v-for="slide in matches"
          :key="slide.id"
          class="block w-full rounded-md px-3 py-2 text-left hover:bg-accent"
          @click="select(slide.id)"
        >
          <span class="block text-sm font-medium">
            {{ slideDisplayName(slide, project.slides.indexOf(slide)) }}
          </span>
          <span class="block truncate font-mono text-[10px] text-muted-foreground">
            {{ slide.code.split("\n")[0] || "Empty slide" }}
          </span>
        </button>
        <p
          v-if="matches.length === 0"
          class="p-8 text-center text-sm text-muted-foreground"
        >
          No slides match “{{ query }}”
        </p>
      </div>
    </div>
  </Overlay>
</template>
