import { createInteractiveDoc } from "~/components/interactive-docs";

import * as backend from "./backend";
import * as frontend from "./frontend";
import { Preview } from "./Preview";
import { pgOptions } from "./type";

export const { Language, Section, InteractiveDoc } = createInteractiveDoc({
  codeExamples: {
    frontend,
    backend,
  },
  pgOptions,
  initialParams: {
    smartRouting: false,
    pg: { name: "hyphen", payMethods: "card" },
  },
  initialSelectedExample: ["react", "node"],
  preview: <Preview />,
});