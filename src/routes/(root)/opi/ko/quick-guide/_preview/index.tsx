import { createInteractiveDoc } from "~/components/interactive-docs";

import * as backend from "./backend";
import * as frontend from "./frontend";
import { PgOptions } from "./type";

export const { Language, Section, InteractiveDoc } = createInteractiveDoc({
  codeExamples: {
    frontend,
    backend,
  },
  pgOptions: PgOptions,
  initialParams: {
    smartRouting: false,
    pg: "hyphen",
  },
  initialSelectedExample: ["react", "express"],
});
