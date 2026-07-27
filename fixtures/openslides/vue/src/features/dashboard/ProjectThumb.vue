<script setup lang="ts">
import { computed } from "vue";
import { FileCode } from "lucide-vue-next";
import type { ProjectSummary } from "$lib/types";
import CodeThumbnail from "$lib/ui/CodeThumbnail.vue";
import { useShikiHtml } from "$lib/shiki/use-shiki-html";

const props = withDefaults(
  defineProps<{
    project: ProjectSummary;
    fontSize?: number;
    class?: string;
    codeClassName?: string;
  }>(),
  { fontSize: 5.5, class: undefined, codeClassName: undefined },
);

const html = useShikiHtml({
  code: computed(() => props.project.firstSlideCode),
  language: computed(() => props.project.language),
  theme: computed(() => props.project.theme),
});
</script>

<template>
  <CodeThumbnail
    :html="project.firstSlideThumbnail || html"
    :theme="project.theme"
    :font-size="fontSize"
    :class="$props.class"
    :code-class-name="codeClassName"
  >
    <template #fallback>
      <FileCode class="h-5 w-5 text-primary" />
    </template>
  </CodeThumbnail>
</template>
