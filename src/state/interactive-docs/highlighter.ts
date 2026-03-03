import { createHighlighterCore } from "shiki/core";
import { createOnigurumaEngine } from "shiki/engine/oniguruma";

export type Highlighter = Awaited<ReturnType<typeof createHighlighterCore>>;

export function initHighlighter() {
  return createHighlighterCore({
    themes: [import("shiki/themes/one-dark-pro.mjs")],
    langs: [
      import("shiki/langs/javascript.mjs"),
      import("shiki/langs/html.mjs"),
      import("shiki/langs/css.mjs"),
      import("shiki/langs/python.mjs"),
      import("shiki/langs/kotlin.mjs"),
    ],
    engine: createOnigurumaEngine(import("shiki/wasm")),
  });
}
