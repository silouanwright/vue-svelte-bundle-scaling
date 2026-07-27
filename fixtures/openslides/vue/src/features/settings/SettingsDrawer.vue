<script setup lang="ts">
import { computed } from "vue";
import { X } from "lucide-vue-next";
import type { Project, ProjectSettings } from "$lib/types";
import { availableThemes } from "$lib/lib/themes";
import Button from "$lib/ui/Button.vue";
import SliderField from "$lib/ui/SliderField.vue";
import Switch from "$lib/ui/Switch.vue";
import { backendConfig } from "$lib/lib/backend-config";

const props = defineProps<{ open: boolean; project: Project }>();
const emit = defineEmits<{
  close: [];
  settings: [patch: Partial<ProjectSettings>];
  theme: [theme: string];
}>();
const settings = computed(() => props.project.settings);
const themes = availableThemes();
</script>

<template>
  <Transition name="drawer">
    <aside
      v-if="open"
      class="fixed inset-y-0 right-0 z-50 w-[360px] overflow-y-auto border-l border-border bg-card shadow-2xl"
      role="dialog"
      aria-label="Settings"
    >
      <header
        class="sticky top-0 z-10 flex h-12 items-center justify-between border-b bg-card/95 px-4 backdrop-blur"
      >
        <h2 class="text-sm font-semibold">Presentation settings</h2>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Close settings"
          @click="emit('close')"
        >
          <X />
        </Button>
      </header>
      <div class="space-y-7 p-4">
        <section class="space-y-3">
          <h3 class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Theme
          </h3>
          <div class="grid grid-cols-4 gap-2">
            <button
              v-for="theme in themes"
              :key="theme.value"
              class="aspect-square rounded-lg border transition-transform hover:scale-105"
              :class="
                project.theme === theme.value
                  ? 'ring-2 ring-primary ring-offset-2 ring-offset-card'
                  : ''
              "
              :style="{ backgroundColor: theme.background }"
              :title="theme.label"
              @click="emit('theme', theme.value)"
            />
          </div>
        </section>
        <section class="space-y-4">
          <h3 class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Preview
          </h3>
          <SliderField
            label="Preview font"
            :value="settings.fontSize"
            :min="10"
            :max="72"
            :step="1"
            :format="(value) => `${value}px`"
            @commit="emit('settings', { fontSize: $event })"
          />
          <SliderField
            label="Line height"
            :value="settings.lineHeight"
            :min="1"
            :max="2.4"
            :step="0.05"
            :format="(value) => value.toFixed(2)"
            @commit="emit('settings', { lineHeight: $event })"
          />
          <SliderField
            label="Editor font"
            :value="settings.editorFontSize"
            :min="10"
            :max="32"
            :step="1"
            :format="(value) => `${value}px`"
            @commit="emit('settings', { editorFontSize: $event })"
          />
          <label class="block space-y-1.5 text-xs">
            <span class="text-muted-foreground">Language</span>
            <select
              :value="settings.language"
              class="h-8 w-full rounded-md border border-input bg-background px-2 text-xs"
              @change="
                emit('settings', {
                  language: ($event.currentTarget as HTMLSelectElement).value,
                })
              "
            >
              <option
                v-for="language in backendConfig.languages"
                :key="language.value"
                :value="language.value"
              >
                {{ language.label }}
              </option>
            </select>
          </label>
          <div class="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Code alignment">
            <button
              v-for="alignment in ['left', 'center'] as const"
              :key="alignment"
              class="rounded-md border px-3 py-2 text-xs capitalize"
              :class="
                settings.codeAlign === alignment
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-input'
              "
              @click="emit('settings', { codeAlign: alignment })"
            >
              {{ alignment }}
            </button>
          </div>
          <label class="flex items-center justify-between gap-4 text-xs">
            Show line numbers
            <Switch
              :model-value="settings.showLineNumbers"
              @update:model-value="
                emit('settings', { showLineNumbers: $event })
              "
            />
          </label>
          <label class="flex items-center justify-between gap-4 text-xs">
            Pure black code background
            <Switch
              :model-value="settings.useBlackCodeBackground"
              @update:model-value="
                emit('settings', { useBlackCodeBackground: $event })
              "
            />
          </label>
          <label class="flex items-center justify-between gap-4 text-xs">
            Highlight step indicator
            <Switch
              :model-value="settings.showHighlightStepIndicator"
              @update:model-value="
                emit('settings', { showHighlightStepIndicator: $event })
              "
            />
          </label>
        </section>
        <section class="space-y-4">
          <h3 class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Motion
          </h3>
          <SliderField
            label="Global transition"
            :value="settings.globalTransitionDuration"
            :min="0"
            :max="2000"
            :step="50"
            :format="(value) => `${value}ms`"
            @commit="
              emit('settings', { globalTransitionDuration: $event })
            "
          />
          <label class="flex items-center justify-between gap-4 text-xs">
            Use global transition
            <Switch
              :model-value="settings.useGlobalTransition"
              @update:model-value="
                emit('settings', { useGlobalTransition: $event })
              "
            />
          </label>
          <label class="flex items-center justify-between gap-4 text-xs">
            Use global stagger
            <Switch
              :model-value="settings.useGlobalStagger"
              @update:model-value="
                emit('settings', { useGlobalStagger: $event })
              "
            />
          </label>
          <label class="flex items-center justify-between gap-4 text-xs">
            Use global highlight settings
            <Switch
              :model-value="settings.useGlobalHighlight"
              @update:model-value="
                emit('settings', { useGlobalHighlight: $event })
              "
            />
          </label>
          <SliderField
            label="Global stagger"
            :value="settings.globalStagger"
            :min="0"
            :max="30"
            :step="1"
            @commit="emit('settings', { globalStagger: $event })"
          />
          <SliderField
            label="Highlight scale"
            :value="settings.globalSizeUpAmount"
            :min="100"
            :max="175"
            :step="1"
            :format="(value) => `${value}%`"
            @commit="emit('settings', { globalSizeUpAmount: $event })"
          />
          <div class="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Highlight dim color">
            <button
              v-for="color in ['theme', 'black'] as const"
              :key="color"
              class="rounded-md border px-3 py-2 text-xs capitalize"
              :class="
                settings.highlightDimColor === color
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-input'
              "
              @click="emit('settings', { highlightDimColor: color })"
            >
              {{ color }}
            </button>
          </div>
          <SliderField
            label="Dim amount"
            :value="settings.globalDimAmount"
            :min="0"
            :max="100"
            :step="1"
            :format="(value) => `${value}%`"
            @commit="emit('settings', { globalDimAmount: $event })"
          />
        </section>
      </div>
    </aside>
  </Transition>
</template>

<style scoped>
.drawer-enter-active,
.drawer-leave-active {
  transition: transform 180ms ease;
}
.drawer-enter-from,
.drawer-leave-to {
  transform: translateX(100%);
}
</style>
