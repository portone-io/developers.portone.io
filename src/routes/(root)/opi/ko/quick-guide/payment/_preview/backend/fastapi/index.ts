import type { CodeExample } from "~/state/interactive-docs/index.jsx";

import type { Params, Sections } from "../../type.js";
import server from "./server.py.js";

export const files = [
  { fileName: "server.py", code: server, language: "python" },
] as const satisfies CodeExample<Params, Sections>[];
