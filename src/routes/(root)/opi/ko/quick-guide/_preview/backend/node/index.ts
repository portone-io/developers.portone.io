import type { CodeExample } from "~/state/interactive-docs/index.jsx";

import type { Params, Sections } from "../../type.js";
import server from "./server.js.js";

export const files = [
  { fileName: "server.js", code: server },
] as const satisfies CodeExample<Params, Sections>[];
