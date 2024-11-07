import { createInteractiveDoc } from "~/components/interactive-docs";

import * as backend from "./backend";
import * as frontend from "./frontend";

export const { Language, Section, InteractiveDoc } = createInteractiveDoc(
  {
    frontend,
    backend,
  },
  {
    smartRouting: false,
  },
  ["react", "express"],
);
