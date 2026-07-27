import { reactive, watch } from "vue";
import type { Highlight } from "$lib/types";
import { applyUiTheme } from "./theme";
import {
  DEFAULT_CODE_SIZE,
  DEFAULT_SLIDES_SIZE,
  loadPersistedUiState,
  savePersistedUiState,
} from "./ui-persistence";
import type {
  PreviewProjectSettings,
  PreviewSlideSettings,
  SaveStatus,
} from "./types";

const persisted = loadPersistedUiState();

export const ui = reactive({
  currentSlideId: null as string | null,
  isPresenting: false,
  isAutoPlaying: false,
  isZenMode: false,
  isBottomPanelCollapsed: persisted.isBottomPanelCollapsed ?? false,
  isCodePanelCollapsed: persisted.isCodePanelCollapsed ?? false,
  codePanelSize: persisted.codePanelSize ?? DEFAULT_CODE_SIZE,
  slidesPanelSize: persisted.slidesPanelSize ?? DEFAULT_SLIDES_SIZE,
  isSettingsOpen: false,
  isCommandOpen: false,
  isGoToSlideOpen: false,
  isShortcutsOpen: false,
  isDarkUi: persisted.isDarkUi ?? true,
  editorShowLineNumbers: persisted.editorShowLineNumbers ?? true,
  showSlideHoverPreview: persisted.showSlideHoverPreview ?? false,
  saveStatus: "idle" as SaveStatus,
  previewHighlightIndex: -1,
  previewProject: {} as PreviewProjectSettings,
  previewSlides: new Map<string, PreviewSlideSettings>(),
  previewHighlights: new Map<string, Partial<Highlight>>(),
});

applyUiTheme(ui.isDarkUi);
watch(
  () => [
    ui.isBottomPanelCollapsed,
    ui.isCodePanelCollapsed,
    ui.codePanelSize,
    ui.slidesPanelSize,
    ui.isDarkUi,
    ui.editorShowLineNumbers,
    ui.showSlideHoverPreview,
  ],
  () =>
    savePersistedUiState({
      isBottomPanelCollapsed: ui.isBottomPanelCollapsed,
      isCodePanelCollapsed: ui.isCodePanelCollapsed,
      codePanelSize: ui.codePanelSize,
      slidesPanelSize: ui.slidesPanelSize,
      isDarkUi: ui.isDarkUi,
      editorShowLineNumbers: ui.editorShowLineNumbers,
      showSlideHoverPreview: ui.showSlideHoverPreview,
    }),
  { deep: true },
);

export const setCurrentSlideId = (value: string | null) =>
  (ui.currentSlideId = value);
export const setIsPresenting = (value: boolean) =>
  (ui.isPresenting = value);
export const setIsAutoPlaying = (value: boolean) =>
  (ui.isAutoPlaying = value);
export const toggleAutoPlaying = () =>
  (ui.isAutoPlaying = !ui.isAutoPlaying);
export const setIsBottomPanelCollapsed = (value: boolean) =>
  (ui.isBottomPanelCollapsed = value);
export const setIsCodePanelCollapsed = (value: boolean) =>
  (ui.isCodePanelCollapsed = value);
export const setCodePanelSize = (value: number) =>
  (ui.codePanelSize = Math.min(70, Math.max(18, Math.round(value))));
export const setSlidesPanelSize = (value: number) =>
  (ui.slidesPanelSize = Math.min(28, Math.max(14, Math.round(value))));
export const setIsGoToSlideOpen = (value: boolean) =>
  (ui.isGoToSlideOpen = value);
export const setIsSettingsOpen = (value: boolean) =>
  (ui.isSettingsOpen = value);
export const setIsCommandOpen = (value: boolean) =>
  (ui.isCommandOpen = value);
export const setIsShortcutsOpen = (value: boolean) =>
  (ui.isShortcutsOpen = value);
export const toggleShortcutsOpen = () =>
  (ui.isShortcutsOpen = !ui.isShortcutsOpen);
export const toggleZenMode = () => (ui.isZenMode = !ui.isZenMode);
export function toggleTheme() {
  ui.isDarkUi = !ui.isDarkUi;
  applyUiTheme(ui.isDarkUi);
}
export const setEditorShowLineNumbers = (value: boolean) =>
  (ui.editorShowLineNumbers = value);
export const setShowSlideHoverPreview = (value: boolean) =>
  (ui.showSlideHoverPreview = value);
export const setSaveStatus = (value: SaveStatus) => (ui.saveStatus = value);
export const setPreviewHighlightIndex = (value: number) =>
  (ui.previewHighlightIndex = value);

export function setPreviewProjectSetting<
  K extends keyof PreviewProjectSettings,
>(key: K, value: PreviewProjectSettings[K] | null) {
  if (value == null) delete ui.previewProject[key];
  else ui.previewProject[key] = value;
}

export function setPreviewSlideSetting<K extends keyof PreviewSlideSettings>(
  slideId: string,
  key: K,
  value: PreviewSlideSettings[K] | null,
) {
  const current = { ...(ui.previewSlides.get(slideId) ?? {}) };
  if (value == null) delete current[key];
  else current[key] = value;
  if (Object.keys(current).length === 0) ui.previewSlides.delete(slideId);
  else ui.previewSlides.set(slideId, current);
}

export function setPreviewHighlightSetting(
  highlightId: string,
  patch: Partial<Highlight>,
) {
  ui.previewHighlights.set(highlightId, {
    ...(ui.previewHighlights.get(highlightId) ?? {}),
    ...patch,
  });
}

export const clearPreviewProjectSetting = (
  key: keyof PreviewProjectSettings,
) => delete ui.previewProject[key];

export function clearPreviewSlideSetting(
  slideId: string,
  key?: keyof PreviewSlideSettings,
) {
  if (!key) return void ui.previewSlides.delete(slideId);
  const current = { ...(ui.previewSlides.get(slideId) ?? {}) };
  delete current[key];
  if (Object.keys(current).length === 0) ui.previewSlides.delete(slideId);
  else ui.previewSlides.set(slideId, current);
}

export function clearPreviewHighlightSetting(
  highlightId: string,
  key?: keyof Highlight,
) {
  if (!key) return void ui.previewHighlights.delete(highlightId);
  const current = { ...(ui.previewHighlights.get(highlightId) ?? {}) };
  delete current[key];
  if (Object.keys(current).length === 0)
    ui.previewHighlights.delete(highlightId);
  else ui.previewHighlights.set(highlightId, current);
}

export function clearAllPreviewSettings() {
  ui.previewProject = {};
  ui.previewSlides = new Map();
  ui.previewHighlights = new Map();
}
