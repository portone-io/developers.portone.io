import type { CodeExample } from "~/state/interactive-docs/index.jsx";
import type { PaymentGateway } from "~/type";

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
  pgName: () => PaymentGateway,
) {
  return (
    "```" +
    codeExample.language +
    " " +
    codeExample.fileName +
    "\n" +
    codeExample.code(codeParams, pgName).code +
    "\n```\n"
  );
}
