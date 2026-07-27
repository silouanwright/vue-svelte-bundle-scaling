<script lang="ts">
  /**
   * Highlight step list with handle-based drag reorder.
   *
   * svelte-dnd-action `dragHandleZone` (reorder only starts from the grip)
   * over a local working copy synced from props, with arrayMove on drop
   * and an optimistic rollback callback on failure.
   */
  import { untrack } from "svelte";
  import {
    dragHandleZone,
    dragHandle as dndHandle,
    type DndEvent,
  } from "svelte-dnd-action";
  import { flip } from "svelte/animate";
  import { highlightSnippets } from "@/features/highlights/highlight-snippets";
  import HighlightRow from "@/features/highlights/HighlightRow.svelte";
  import DragHandle from "$lib/ui/DragHandle.svelte";
  import type { Highlight } from "$lib/types";

  let {
    highlights,
    code,
    expandedId,
    previewIndex,
    onToggleExpand,
    onUpdate,
    onDelete,
    onPreview,
    onMove,
    onReorder,
    useGlobalHighlight = false,
  }: {
    highlights: Highlight[];
    code: string;
    expandedId: string | null;
    previewIndex: number;
    onToggleExpand: (id: string) => void;
    onUpdate: (id: string, patch: Partial<Highlight>) => void;
    onDelete: (id: string) => void;
    onPreview: (index: number) => void;
    onMove: (id: string, direction: -1 | 1) => void;
    onReorder: (ids: string[], rollback: () => void) => void;
    useGlobalHighlight?: boolean;
  } = $props();

  interface RowItem {
    id: string;
    highlight: Highlight;
  }

  const flipDurationMs = 150;

  /**
   * Local working copy. Re-synced ONLY when the `highlights` prop changes
   * — never when `items` itself changes — so an in-flight optimistic
   * reorder is not clobbered.
   */
  let items = $state<RowItem[]>([]);
  $effect(() => {
    const source = highlights;
    untrack(() => {
      if (
        items.length !== source.length ||
        source.some(
          (h, i) => items[i]?.id !== h.id || items[i]?.highlight !== h,
        )
      ) {
        items = source.map((h) => ({ id: h.id, highlight: h }));
      }
    });
  });

  const snippets = $derived(
    highlightSnippets(
      code,
      items.map((item) => item.highlight),
    ),
  );

  function handleConsider(e: CustomEvent<DndEvent<RowItem>>) {
    items = e.detail.items;
  }

  function handleFinalize(e: CustomEvent<DndEvent<RowItem>>) {
    const previous = items;
    items = e.detail.items;
    const ids = items.map((item) => item.id);
    if (ids.join("\0") === highlights.map((h) => h.id).join("\0")) return;
    onReorder(ids, () => {
      items = previous;
    });
  }
</script>

{#snippet rowHandle()}
  <!-- mousedown/touchstart bubble to this wrapper where the lib's
       dragHandle action listens; clicks stop here so row buttons don't fire. -->
  <span
    use:dndHandle
    class="inline-flex shrink-0"
    onclick={(e) => e.stopPropagation()}
    role="presentation"
  >
    <DragHandle
      iconClassName="h-3 w-3"
      disabled={highlights.length < 2}
      aria-label="Drag to reorder highlight"
    />
  </span>
{/snippet}

{#if highlights.length > 0}
  <div class="border-t border-border/50 bg-muted/20">
    <div class="flex items-center justify-between px-2 py-1.5">
      <span
        class="text-[10px] font-medium tracking-wide text-muted-foreground uppercase"
        >Highlight steps ({highlights.length})</span
      >
      {#if useGlobalHighlight}
        <span class="text-[9px] font-medium text-primary">GLOBAL</span>
      {:else}
        <span class="text-[9px] text-muted-foreground/70"
          >Plays in order on →</span
        >
      {/if}
    </div>
    <div
      class="max-h-[180px] space-y-1 overflow-y-auto px-2 pb-2"
      use:dragHandleZone={{
        items,
        flipDurationMs,
        dragDisabled: highlights.length < 2,
        type: "highlight-rows",
        dropTargetStyle: {},
      }}
      onconsider={handleConsider}
      onfinalize={handleFinalize}
    >
      {#each items as item, index (item.id)}
        <div animate:flip={{ duration: flipDurationMs }}>
          <HighlightRow
            highlight={item.highlight}
            {index}
            total={items.length}
            snippet={snippets[index]}
            isExpanded={expandedId === item.id}
            isPreviewing={previewIndex === index}
            dragHandle={rowHandle}
            {onToggleExpand}
            {onMove}
            {onPreview}
            {onDelete}
            {onUpdate}
            disabled={useGlobalHighlight}
          />
        </div>
      {/each}
    </div>
  </div>
{/if}
