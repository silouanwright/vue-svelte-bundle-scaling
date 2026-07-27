<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { Loader2, Plus, X } from "lucide-vue-next";
import {
  DEFAULT_LANGUAGE,
  DEFAULT_THEME,
  NEW_PRESENTATION_CODE,
} from "$lib/constants";
import { availableThemes } from "$lib/lib/themes";
import { useShikiHtml } from "$lib/shiki/use-shiki-html";
import Button from "$lib/ui/Button.vue";
import CodeThumbnail from "$lib/ui/CodeThumbnail.vue";

const props = withDefaults(
  defineProps<{
    expanded: boolean;
    name: string;
    selectedTheme: string;
    pending: boolean;
    standalone?: boolean;
  }>(),
  { standalone: false },
);
const emit = defineEmits<{
  "update:expanded": [value: boolean];
  "update:name": [value: string];
  "update:selectedTheme": [value: string];
  create: [];
}>();
const input = ref<HTMLInputElement | null>(null);
const themes = availableThemes();
const resolvedTheme = computed(
  () => props.selectedTheme || themes[0]?.value || DEFAULT_THEME,
);
const preview = useShikiHtml({
  code: NEW_PRESENTATION_CODE,
  language: DEFAULT_LANGUAGE,
  theme: resolvedTheme,
});

watch(
  () => props.expanded,
  async (expanded) => {
    if (!expanded) return;
    await nextTick();
    input.value?.focus();
  },
);
</script>

<template>
  <div
    v-if="!expanded"
    role="button"
    tabindex="0"
    class="group flex h-full min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-card/40 p-6 text-center transition-all duration-200 hover:border-primary/60 hover:bg-card/80 hover:shadow-md"
    aria-label="Create new presentation"
    @click="emit('update:expanded', true)"
    @keydown.enter="emit('update:expanded', true)"
    @keydown.space.prevent="emit('update:expanded', true)"
  >
    <div
      class="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform duration-200 group-hover:scale-110"
    >
      <Plus class="h-5 w-5" />
    </div>
    <h3 class="text-sm font-semibold text-foreground">New Presentation</h3>
    <p class="mt-1 text-xs text-muted-foreground">
      Click or press Enter to start
    </p>
  </div>
  <div
    v-else
    class="mb-8 rounded-xl border border-primary/40 bg-card p-5 shadow-lg"
  >
    <div
      class="mb-4 flex items-center justify-between border-b border-border/40 pb-3"
    >
      <div>
        <h3 class="text-base font-semibold">Create New Presentation</h3>
        <p class="text-xs text-muted-foreground">
          Configure your deck theme and starting slide preview
        </p>
      </div>
      <Button
        v-if="!standalone"
        variant="ghost"
        size="icon"
        @click="emit('update:expanded', false)"
      >
        <X />
      </Button>
    </div>
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div class="flex flex-col justify-between gap-5 lg:col-span-5">
        <div class="space-y-4">
          <div>
            <label
              for="create-deck-name"
              class="mb-1.5 block text-xs font-medium"
            >
              Presentation Name
            </label>
            <input
              id="create-deck-name"
              ref="input"
              :value="name"
              class="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
              placeholder="Untitled Presentation"
              @input="
                emit(
                  'update:name',
                  ($event.currentTarget as HTMLInputElement).value,
                )
              "
              @keydown.enter="emit('create')"
            />
          </div>
          <div>
            <span class="mb-1.5 block text-xs font-medium">
              Theme Color Palette
            </span>
            <div class="flex flex-wrap gap-2 pt-1">
              <button
                v-for="theme in themes"
                :key="theme.value"
                type="button"
                :title="theme.label"
                :aria-label="`Select theme ${theme.label}`"
                class="h-5 w-5 rounded-full border border-border/80 transition-all hover:scale-125"
                :class="
                  resolvedTheme === theme.value
                    ? 'scale-110 ring-2 ring-primary ring-offset-2 ring-offset-background'
                    : 'opacity-80'
                "
                :style="{ backgroundColor: theme.background }"
                @click="emit('update:selectedTheme', theme.value)"
              />
            </div>
          </div>
        </div>
        <div class="flex items-center gap-2 pt-2">
          <Button :disabled="pending" @click="emit('create')">
            <Loader2 v-if="pending" class="animate-spin" />
            Create Presentation
          </Button>
          <Button
            v-if="!standalone"
            variant="ghost"
            @click="emit('update:expanded', false)"
          >
            Cancel
          </Button>
        </div>
      </div>
      <div class="flex flex-col lg:col-span-7">
        <span class="mb-1.5 block text-xs font-medium">
          Live Starting Slide Preview
        </span>
        <div
          class="relative flex-1 rounded-lg border border-border/60 bg-background/50 p-1"
        >
          <CodeThumbnail
            :html="preview"
            :theme="resolvedTheme"
            :font-size="7.5"
            :line-height="1.4"
            class="h-44 w-full rounded-md border border-border/40 p-3 shadow-inner"
          />
        </div>
      </div>
    </div>
  </div>
</template>
