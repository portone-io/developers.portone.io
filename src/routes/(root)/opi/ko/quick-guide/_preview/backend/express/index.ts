import type { CodeExample } from "~/components/interactive-docs/index.jsx";

import type { Params, Sections } from "../../type.js";
import server from "./server.js";

export const files = [
  { fileName: "server.js", code: server },
] as const satisfies CodeExample<Params, Sections>[];
