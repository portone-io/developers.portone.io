import type { CodeExample } from "~/state/interactive-docs/index.jsx";

import { type Params, type Sections } from "./type";

export function markdownResponse(content: string, status: number) {
  return new Response(content, {
    status,
    headers: {
      "Content-Type": "text/markdown; charset=UTF-8",
    },
  });
}

export function formatCodeExample(
  codeExample: CodeExample<Params, Sections>,
  codeParams: Params,
) {
  return (
    "```" +
    codeExample.language +
    " " +
    codeExample.fileName +
    "\n" +
    codeExample.code(codeParams).code +
    "\n```\n"
  );
}
