import { createInteractiveDoc } from "~/components/interactive-docs";

import * as backend from "./backend";
import * as frontend from "./frontend";
import { Preview } from "./Preview";
import { pgOptions } from "./type";

export const { Section, InteractiveDoc, Condition, Toggle, preload } =
  createInteractiveDoc({
    codeExamples: {
      frontend,
      backend,
    },
    pgOptions,
    fallbackPg: "toss",
    initialParams: {
      payMethod: "card",
    },
    initialSelectedExample: ["React", "Express"],
    preview: Preview,
  });
