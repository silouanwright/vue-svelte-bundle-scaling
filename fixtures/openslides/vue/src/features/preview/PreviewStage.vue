<script setup lang="ts">
import { computed, shallowRef, watch } from "vue";
import type { Highlighter } from "shiki";
import { ShikiMagicMove } from "shiki-magic-move/vue";
import "shiki-magic-move/dist/style.css";
import type { Highlight, Project, Slide } from "$lib/types";
import { resolveProjectLanguage } from "$lib/types";
import { fallbackForeground, themeBackground } from "$lib/lib/themes";
import { getHighlighter } from "$lib/shiki/shiki-instance";
import { useShikiHtml } from "$lib/shiki/use-shiki-html";

const props = withDefaults(
  defineProps<{
    project: Project;
    slide: Slide;
    highlightIndex?: number;
    compact?: boolean;
  }>(),
  { highlightIndex: -1, compact: false },
);
const language = computed(() => resolveProjectLanguage(props.project));
const highlighter = shallowRef<Highlighter | null>(null);
let highlighterRevision = 0;
watch(
  [() => props.project.theme, language],
  ([theme, currentLanguage]) => {
    const revision = ++highlighterRevision;
    // ShikiMagicMove reads the requested theme synchronously. Clear the
    // previous instance while the singleton loads a newly selected theme or
    // language so it cannot render against assets that are not ready yet.
    highlighter.value = null;
    void getHighlighter(theme, currentLanguage).then((instance) => {
      if (revision === highlighterRevision) highlighter.value = instance;
    });
  },
  { immediate: true },
);
const html = useShikiHtml({
  code: computed(() => props.slide.code),
  language,
  theme: computed(() => props.project.theme),
});
const lines = computed(() => (html.value ?? "").split("\n"));
const activeHighlight = computed<Highlight | undefined>(
  () => props.slide.highlights[props.highlightIndex],
);
const transitionDuration = computed(() =>
  props.project.settings.useGlobalTransition
    ? props.project.settings.globalTransitionDuration
    : props.slide.transitionDuration,
);
const stagger = computed(() =>
  props.project.settings.useGlobalStagger
    ? props.project.settings.globalStagger
    : props.slide.stagger,
);
const magicMoveOptions = computed(() => ({
  duration: transitionDuration.value,
  stagger: stagger.value,
  lineNumbers: props.project.settings.showLineNumbers,
}));
const background = computed(() =>
  props.project.settings.useBlackCodeBackground
    ? "#000000"
    : themeBackground(props.project.theme),
);
const foreground = computed(() => fallbackForeground(props.project.theme));

function dimmed(index: number) {
  const highlight = activeHighlight.value;
  return (
    highlight &&
    (index < highlight.startLine || index > highlight.endLine)
  );
}
</script>

<template>
  <div
    class="relative flex h-full w-full overflow-auto"
    :class="
      project.settings.codeAlign === 'center'
        ? 'items-center justify-center'
        : 'items-center justify-start'
    "
    :style="{
      backgroundColor: background,
      color: foreground,
      padding: compact ? '16px' : 'clamp(24px, 6vw, 96px)',
    }"
  >
    <div
      v-if="!compact && highlighter && !activeHighlight"
      :key="`${project.theme}-${language}-${project.settings.showLineNumbers}`"
      class="min-w-0 font-mono font-medium tracking-wide"
      :style="{
        fontSize: `${project.settings.fontSize}px`,
        lineHeight: project.settings.lineHeight,
      }"
    >
      <ShikiMagicMove
        :highlighter="highlighter"
        :lang="language"
        :theme="project.theme"
        :code="slide.code"
        :options="magicMoveOptions"
      />
    </div>
    <pre
      v-else
      class="m-0 min-w-0 font-mono"
      :style="{
        fontSize: `${compact ? Math.max(6, project.settings.fontSize / 2) : project.settings.fontSize}px`,
        lineHeight: project.settings.lineHeight,
      }"
    ><code><span
      v-for="(line, index) in lines"
      :key="index"
      :data-highlight-dim-effect="dimmed(index) ? '' : undefined"
      :data-highlight-scale-effect="
        activeHighlight &&
        !dimmed(index) &&
        activeHighlight.sizeUpEnabled
          ? ''
          : undefined
      "
      class="block min-h-[1em] origin-left transition-[opacity,transform] duration-300"
      :style="{
        opacity: dimmed(index)
          ? Math.max(0.05, 1 - (activeHighlight?.dimAmount ?? 75) / 100)
          : 1,
        transform:
          activeHighlight &&
          !dimmed(index) &&
          activeHighlight.sizeUpEnabled
            ? `scale(${activeHighlight.sizeUpAmount / 100})`
            : undefined,
      }"
    ><span
      v-if="project.settings.showLineNumbers"
      class="mr-5 inline-block w-8 text-right opacity-35 select-none"
    >{{ index + 1 }}</span><span v-html="line || ' '" /></span></code></pre>
    <div
      v-if="
        project.settings.showHighlightStepIndicator &&
        slide.highlights.length > 0
      "
      class="absolute right-4 bottom-4 rounded-full bg-black/35 px-3 py-1 text-xs text-white backdrop-blur"
    >
      {{ highlightIndex + 1 }} / {{ slide.highlights.length }}
    </div>
  </div>
</template>
