<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from "vue";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Code2,
  Search,
  X,
} from "lucide-vue-next";
import type { Slide } from "$lib/types";
import { cn } from "$lib/lib/utils";
import {
  record,
  redo,
  undo,
  withoutRecording,
  type Snapshot,
} from "$lib/lib/editor-history";
import { requestHtml } from "$lib/shiki/shiki-worker-client";
import Button from "$lib/ui/Button.vue";

const props = defineProps<{
  slide: Slide;
  language: string;
  theme: string;
  fontSize: number;
  showLineNumbers: boolean;
  saveStatus: "idle" | "saving" | "saved" | "error";
}>();
const emit = defineEmits<{
  change: [code: string];
  selection: [
    range: { start: number; end: number; startLine: number; endLine: number },
  ];
}>();
const textarea = ref<HTMLTextAreaElement | null>(null);
const highlighted = ref<HTMLPreElement | null>(null);
const highlightedHtml = ref<string | null>(null);
const findOpen = ref(false);
const find = ref("");
const replace = ref("");
const matchCase = ref(false);
const currentMatchIndex = ref(0);
const lineCount = computed(() => props.slide.code.split("\n").length);
let highlightAbort: AbortController | undefined;
const matches = computed(() => {
  if (!find.value) return [] as Array<{ start: number; end: number }>;
  const needle = matchCase.value ? find.value : find.value.toLowerCase();
  const haystack = matchCase.value
    ? props.slide.code
    : props.slide.code.toLowerCase();
  const result: Array<{ start: number; end: number }> = [];
  let position = 0;
  while (result.length <= 1000) {
    const index = haystack.indexOf(needle, position);
    if (index < 0) break;
    result.push({ start: index, end: index + needle.length });
    position = index + Math.max(needle.length, 1);
  }
  return result;
});

function reportSelection() {
  const target = textarea.value;
  if (!target || target.selectionStart === target.selectionEnd) return;
  const before = props.slide.code.slice(0, target.selectionStart);
  const selected = props.slide.code.slice(
    target.selectionStart,
    target.selectionEnd,
  );
  emit("selection", {
    start: target.selectionStart,
    end: target.selectionEnd,
    startLine: before.split("\n").length - 1,
    endLine: before.split("\n").length + selected.split("\n").length - 2,
  });
}

function syncScroll(event: Event) {
  const target = event.currentTarget as HTMLTextAreaElement;
  if (!highlighted.value) return;
  highlighted.value.scrollTop = target.scrollTop;
  highlighted.value.scrollLeft = target.scrollLeft;
}

async function openFind() {
  findOpen.value = true;
  await nextTick();
  document.querySelector<HTMLInputElement>("#editor-find")?.focus();
}

function snapshot(code: string, caretStart: number, caretEnd: number): Snapshot {
  return { code, caretStart, caretEnd };
}

function applyCode(value: string, caretStart?: number, caretEnd?: number) {
  const target = textarea.value;
  const start = caretStart ?? target?.selectionStart ?? value.length;
  const end = caretEnd ?? target?.selectionEnd ?? start;
  record(
    props.slide.id,
    snapshot(
      props.slide.code,
      target?.selectionStart ?? props.slide.code.length,
      target?.selectionEnd ?? props.slide.code.length,
    ),
    snapshot(value, start, end),
  );
  emit("change", value);
  nextTick(() => target?.setSelectionRange(start, end));
}

function handleInput(event: Event) {
  const target = event.currentTarget as HTMLTextAreaElement;
  const value = target.value;
  const delta = value.length - props.slide.code.length;
  const beforeCaret = Math.max(0, target.selectionStart - delta);
  record(
    props.slide.id,
    snapshot(props.slide.code, beforeCaret, beforeCaret),
    snapshot(value, target.selectionStart, target.selectionEnd),
  );
  emit("change", value);
}

function selectMatch(index: number, focusEditor = true) {
  const target = textarea.value;
  const match = matches.value[index];
  if (!target || !match) return;
  currentMatchIndex.value = index;
  if (focusEditor) target.focus();
  target.setSelectionRange(match.start, match.end);
  const line = props.slide.code.slice(0, match.start).split("\n").length;
  target.scrollTop = Math.max(
    0,
    line * props.fontSize * 1.5 - target.clientHeight / 2,
  );
}

function goNext() {
  if (!matches.value.length) return;
  selectMatch((currentMatchIndex.value + 1) % matches.value.length);
}

function goPrevious() {
  if (!matches.value.length) return;
  selectMatch(
    (currentMatchIndex.value - 1 + matches.value.length) %
      matches.value.length,
  );
}

function replaceCurrent() {
  const match = matches.value[currentMatchIndex.value];
  if (!match) return;
  const value =
    props.slide.code.slice(0, match.start) +
    replace.value +
    props.slide.code.slice(match.end);
  applyCode(value, match.start, match.start + replace.value.length);
}

function replaceAll() {
  if (!find.value || !matches.value.length) return;
  const value = matchCase.value
    ? props.slide.code.split(find.value).join(replace.value)
    : props.slide.code.replace(
        new RegExp(find.value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi"),
        () => replace.value,
      );
  applyCode(value);
}

function applyHistory(direction: "undo" | "redo") {
  const target = textarea.value;
  const entry =
    direction === "undo" ? undo(props.slide.id) : redo(props.slide.id);
  if (!target || !entry) return false;
  withoutRecording(() => emit("change", entry.code));
  nextTick(() => {
    target.value = entry.code;
    target.focus();
    target.setSelectionRange(entry.caretStart, entry.caretEnd);
  });
  return true;
}

function onKeydown(event: KeyboardEvent) {
  const isMod = event.metaKey || event.ctrlKey;
  const key = event.key.toLowerCase();
  if (isMod && (key === "z" || key === "y")) {
    event.preventDefault();
    applyHistory(key === "y" || event.shiftKey ? "redo" : "undo");
    return;
  }
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "f") {
    event.preventDefault();
    void openFind();
  }
  if (event.key === "Tab") {
    event.preventDefault();
    const target = event.currentTarget as HTMLTextAreaElement;
    const value =
      target.value.slice(0, target.selectionStart) +
      "  " +
      target.value.slice(target.selectionEnd);
    const caret = target.selectionStart + 2;
    applyCode(value, caret, caret);
  }
}

watch(
  () => props.slide.id,
  () => {
    findOpen.value = false;
    find.value = "";
    replace.value = "";
    currentMatchIndex.value = 0;
  },
);
watch(
  [() => props.slide.code, () => props.language, () => props.theme],
  async ([code, language, theme]) => {
    highlightAbort?.abort();
    const controller = new AbortController();
    highlightAbort = controller;
    try {
      const response = await requestHtml(
        code,
        language,
        theme,
        controller.signal,
        "high",
      );
      if (!controller.signal.aborted) highlightedHtml.value = response.html ?? null;
    } catch (error) {
      if (
        !controller.signal.aborted &&
        !(error instanceof DOMException && error.name === "AbortError")
      ) {
        highlightedHtml.value = null;
      }
    }
  },
  { immediate: true },
);
watch([find, matchCase], () => {
  currentMatchIndex.value = 0;
  if (findOpen.value && matches.value.length) {
    nextTick(() => selectMatch(0, false));
  }
});
onBeforeUnmount(() => highlightAbort?.abort());
</script>

<template>
  <section class="flex h-full min-w-0 flex-col bg-card/60">
    <header
      class="flex h-10 shrink-0 items-center justify-between border-b border-border/50 px-3"
    >
      <div class="flex min-w-0 items-center gap-2">
        <Code2 class="h-3.5 w-3.5 text-muted-foreground" />
        <span class="truncate text-xs font-medium">
          {{ slide.name || "Untitled slide" }}
        </span>
      </div>
      <div class="flex items-center gap-2">
        <span
          :class="
            cn(
              'text-[10px] text-muted-foreground',
              saveStatus === 'error' && 'text-destructive',
            )
          "
        >
          <Check v-if="saveStatus === 'saved'" class="mr-1 inline h-3 w-3" />
          {{ saveStatus === "saving" ? "Saving…" : saveStatus }}
        </span>
        <Button
          variant="ghost"
          size="icon"
          title="Find/Replace"
          @click="openFind"
        >
          <Search />
        </Button>
      </div>
    </header>
    <div
      v-if="findOpen"
      class="flex shrink-0 items-center gap-2 border-b border-border/50 bg-background/70 p-2"
    >
      <input
        id="editor-find"
        v-model="find"
        class="h-7 min-w-0 flex-1 rounded border bg-background px-2 text-xs"
        placeholder="Find"
        aria-label="Find"
        @keydown.enter.exact="goNext"
        @keydown.shift.enter="goPrevious"
      />
      <span class="text-[10px] text-muted-foreground">
        {{
          matches.length
            ? `${currentMatchIndex + 1}/${matches.length}`
            : "0/0"
        }}
      </span>
      <Button
        variant="ghost"
        size="icon"
        class="h-7 w-7"
        title="Previous"
        @click="goPrevious"
      >
        <ChevronUp />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        class="h-7 w-7"
        title="Next"
        @click="goNext"
      >
        <ChevronDown />
      </Button>
      <input
        v-model="replace"
        class="h-7 min-w-0 flex-1 rounded border bg-background px-2 text-xs"
        placeholder="Replace"
        aria-label="Replace"
      />
      <Button size="sm" variant="outline" @click="replaceCurrent">
        Replace
      </Button>
      <Button size="sm" variant="outline" @click="replaceAll">
        Replace All
      </Button>
      <label class="flex items-center gap-1 text-[10px] text-muted-foreground">
        <input v-model="matchCase" type="checkbox" class="h-3 w-3" />
        Aa
      </label>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Close find"
        @click="findOpen = false"
      >
        <X />
      </Button>
    </div>
    <div class="relative min-h-0 flex-1 overflow-hidden">
      <div
        v-if="showLineNumbers"
        class="pointer-events-none absolute inset-y-0 left-0 z-10 w-11 overflow-hidden border-r border-border/40 bg-muted/20 pt-4 text-right font-mono text-muted-foreground/60"
        :style="{ fontSize: `${fontSize}px`, lineHeight: 1.5 }"
      >
        <div v-for="line in lineCount" :key="line" class="pr-3">
          {{ line }}
        </div>
      </div>
      <pre
        ref="highlighted"
        aria-hidden="true"
        class="editor-highlight pointer-events-none absolute inset-0 m-0 overflow-auto p-4 font-mono whitespace-pre"
        :class="showLineNumbers && 'pl-14'"
        :style="{ fontSize: `${fontSize}px`, lineHeight: 1.5 }"
      ><code v-if="highlightedHtml" v-html="`${highlightedHtml}\n`" /><code v-else>{{ `${slide.code}\n` }}</code></pre>
      <textarea
        ref="textarea"
        :value="slide.code"
        spellcheck="false"
        autocapitalize="off"
        autocomplete="off"
        class="absolute inset-0 h-full w-full resize-none overflow-auto bg-transparent p-4 font-mono text-transparent caret-foreground outline-none"
        :class="showLineNumbers && 'pl-14'"
        :style="{ fontSize: `${fontSize}px`, lineHeight: 1.5 }"
        data-openslides-editor
        @input="handleInput"
        @select="reportSelection"
        @mouseup="reportSelection"
        @keyup="reportSelection"
        @keydown="onKeydown"
        @scroll="syncScroll"
      />
    </div>
    <footer
      class="flex h-7 shrink-0 items-center justify-between border-t border-border/50 px-3 text-[10px] text-muted-foreground"
    >
      <span>{{ slide.code.length.toLocaleString() }} characters</span>
      <span>{{ lineCount }} lines</span>
    </footer>
  </section>
</template>
