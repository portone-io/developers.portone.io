import { createInteractiveDoc } from "~/components/interactive-docs";

import * as backend from "./backend";
import * as frontend from "./frontend";
import { Preview } from "./Preview";
import { pgOptions } from "./type";

export const { Section, InteractiveDoc, Condition, Toggle } =
  createInteractiveDoc({
    codeExamples: {
      frontend,
      backend,
    },
    pgOptions,
    initialParams: {
      smartRouting: false,
      pg: { name: "toss", payMethods: "card" },
    },
    initialSelectedExample: ["react", "node"],
    preview: Preview,
  });
