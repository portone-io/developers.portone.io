import type { CodeExample } from "~/state/interactive-docs/index.jsx";

import type { Params, Sections } from "../../type.js";
import app from "./app.jsx.js";

export const files = [
  { fileName: "app.jsx", code: app },
] as const satisfies CodeExample<Params, Sections>[];
