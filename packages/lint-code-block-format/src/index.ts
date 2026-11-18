import type { ESLint } from "eslint";

import { rule } from "./rule.ts";

const plugin: ESLint.Plugin = {
  meta: { name: "@portone-io/lint-code-block-format" },
  rules: { format: rule },
};

export default plugin;
