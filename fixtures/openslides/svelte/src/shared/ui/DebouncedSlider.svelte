<script lang="ts">
  import Slider from "./Slider.svelte";

  /**
   * DebouncedSlider — fixes slider IPC spam (8 IPC calls per drag → 1)
   * but now supports instant preview via onValueChange.
   *
   * - Local state for thumb position (immediate)
   * - onValueChange (instant) → updates the preview rune store for live SlidePreview
   * - onValueCommit (pointer up) → fires Tauri IPC + TanStack Query + clears preview sync
   */
  let {
    value,
    min,
    max,
    step,
    disabled,
    onValueChange,
    onValueCommit,
    onChange,
    onCommit,
    class: className,
    ...rest
  }: {
    id?: string;
    value: number[];
    min?: number;
    max?: number;
    step?: number;
    disabled?: boolean;
    /** Instant update (drag) — for preview rune state */
    onValueChange?: (value: number[]) => void;
    /** DB commit (pointer up) — for IPC */
    onValueCommit?: (value: number[]) => void;
    /** Convenience single-value callbacks */
    onChange?: (value: number) => void;
    onCommit?: (value: number) => void;
    class?: string;
    "aria-labelledby"?: string;
    "aria-label"?: string;
  } = $props();

  // Writable derived state follows external updates while allowing the bound
  // slider to override it during the current interaction.
  let local = $derived(value);

  function handleValueChange(v: number[]) {
    onValueChange?.(v);
    if (v[0] !== undefined) onChange?.(v[0]);
  }

  function handleCommit(v: number[]) {
    onValueCommit?.(v);
    if (v[0] !== undefined) onCommit?.(v[0]);
  }
</script>

<Slider
  {min}
  {max}
  {step}
  {disabled}
  bind:value={local}
  onValueChange={handleValueChange}
  onValueCommit={handleCommit}
  class={className}
  {...rest}
/>
