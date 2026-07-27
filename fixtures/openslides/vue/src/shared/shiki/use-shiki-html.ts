import { ref, toValue, watchEffect, type MaybeRefOrGetter, type Ref } from "vue";
import { getHighlighter } from "./shiki-instance";
import { extractShikiCodeHtml } from "./extract-html";

export function useShikiHtml(options: {
  code: MaybeRefOrGetter<string>;
  language: MaybeRefOrGetter<string>;
  theme: MaybeRefOrGetter<string>;
}): Ref<string | null> {
  const html = ref<string | null>(null);
  let revision = 0;

  watchEffect(() => {
    const code = toValue(options.code);
    const language = toValue(options.language);
    const theme = toValue(options.theme);
    const current = ++revision;
    void getHighlighter(theme, language).then((highlighter) => {
      if (current !== revision) return;
      html.value = extractShikiCodeHtml(
        highlighter.codeToHtml(code, { lang: language, theme }),
      );
    });
  });

  return html;
}
