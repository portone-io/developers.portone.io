import type { Tab } from "~/components/code-preview/index.jsx";

import type { Params } from "../../type.js";
import server from "./server.js";

export type { Params };
export type Sections = "server:import-portone-sdk";

export const tabs = [
  { fileName: "server.js", code: server },
] as const satisfies Tab<Params, Sections>[];
