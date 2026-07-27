import { THEMES, type ThemeMeta } from "./theme-meta";

export { THEMES } from "./theme-meta";
export const THEME_OPTIONS = THEMES.map(({ value, label }) => ({
  value,
  label,
}));

export function availableThemes(): ThemeMeta[] {
  return [...THEMES];
}
export function themeBackground(theme: string): string {
  return (
    THEMES.find((entry) => entry.value === theme)?.background ?? "#1e1e1e"
  );
}
export function fallbackForeground(theme: string): string {
  return THEMES.find((entry) => entry.value === theme)?.light
    ? "#383a42"
    : "#abb2bf";
}
