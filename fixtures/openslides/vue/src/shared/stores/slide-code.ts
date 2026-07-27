import { reactive } from "vue";

const localCode = reactive<Record<string, string>>({});

interface SlideLike {
  id: string;
  code: string;
}

export function effectiveSlideCode(slide: SlideLike | undefined): string {
  return slide ? (localCode[slide.id] ?? slide.code) : "";
}
export const getLocalCode = (id: string) => localCode[id];
export function setLocalCode(id: string, code: string) {
  if (localCode[id] !== code) localCode[id] = code;
}
export const clearLocalCode = (id: string) => delete localCode[id];
export function clearAllLocalCode() {
  for (const id of Object.keys(localCode)) delete localCode[id];
}
