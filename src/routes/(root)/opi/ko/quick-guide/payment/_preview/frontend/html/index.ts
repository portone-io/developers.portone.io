import type { CodeExample } from "~/state/interactive-docs/index.jsx";

import type { Params, Sections } from "../../type.js";
import indexHtml from "./index.html";

export const files = [
  { fileName: "index.html", code: indexHtml, language: "html" },
] as const satisfies CodeExample<Params, Sections>[];
