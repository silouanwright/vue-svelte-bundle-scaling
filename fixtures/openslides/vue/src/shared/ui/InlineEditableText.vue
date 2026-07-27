<script setup lang="ts">
import { nextTick, onMounted, ref } from "vue";
import { Check, X } from "lucide-vue-next";
import { cn } from "$lib/lib/utils";
import Button from "./Button.vue";

const props = withDefaults(
  defineProps<{
    modelValue: string;
    withButtons?: boolean;
    commitBusy?: boolean;
    class?: string;
    buttonSize?: "sm" | "md";
    stopPropagation?: boolean;
    label?: string;
  }>(),
  {
    withButtons: false,
    commitBusy: false,
    class: undefined,
    buttonSize: "md",
    stopPropagation: true,
    label: "Edit name",
  },
);
const emit = defineEmits<{
  "update:modelValue": [value: string];
  commit: [];
  cancel: [];
}>();
const input = ref<HTMLInputElement | null>(null);

onMounted(async () => {
  await nextTick();
  input.value?.focus();
  input.value?.select();
});

function onKeydown(event: KeyboardEvent) {
  if (props.stopPropagation) event.stopPropagation();
  if (event.key === "Enter") emit("commit");
  if (event.key === "Escape") emit("cancel");
}
</script>

<template>
  <div
    :class="withButtons ? 'flex items-center gap-1' : undefined"
    @click="stopPropagation && $event.stopPropagation()"
  >
    <input
      ref="input"
      :aria-label="label"
      :class="
        cn(
          'select-text rounded-md border border-input bg-background px-2 text-sm outline-none focus:ring-1 focus:ring-ring',
          withButtons ? 'h-8 min-w-0 flex-1' : 'h-7 w-full',
          $props.class,
        )
      "
      :value="modelValue"
      @input="
        emit(
          'update:modelValue',
          ($event.currentTarget as HTMLInputElement).value,
        )
      "
      @blur="emit('commit')"
      @keydown="onKeydown"
    />
    <template v-if="withButtons">
      <Button
        variant="ghost"
        size="icon"
        :class="
          cn(
            'shrink-0',
            buttonSize === 'sm' && 'h-5 w-5 [&_svg]:size-3',
            buttonSize === 'md' && 'h-8 w-8',
          )
        "
        :disabled="commitBusy"
        @mousedown.prevent
        @click="emit('commit')"
      >
        <Check class="text-emerald-500" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        :class="
          cn(
            'shrink-0',
            buttonSize === 'sm' && 'h-5 w-5 [&_svg]:size-3',
            buttonSize === 'md' && 'h-8 w-8',
          )
        "
        @mousedown.prevent
        @click="emit('cancel')"
      >
        <X />
      </Button>
    </template>
  </div>
</template>
