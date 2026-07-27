import { reactive } from "vue";
import { api } from "./tauri-api";
import {
  FALLBACK_SUPPORTED_LANGUAGES,
  type LanguageOption,
} from "./language-meta";
import { THEMES, type ThemeMeta } from "./theme-meta";

export const backendConfig = reactive({
  languages: [...FALLBACK_SUPPORTED_LANGUAGES] as LanguageOption[],
  themes: [...THEMES] as ThemeMeta[],
  loaded: false,
});

export async function initBackendConfig() {
  try {
    const [languages, themes] = await Promise.all([
      api.getSupportedLanguages(),
      api.getSupportedThemes(),
    ]);
    backendConfig.languages = languages;
    backendConfig.themes = themes;
    backendConfig.loaded = true;
  } catch {
    // Browser/tests and older backends use the bundled fallback metadata.
  }
}
