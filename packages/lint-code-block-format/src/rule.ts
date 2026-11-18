import path from "node:path";

import type { JSRuleDefinition } from "eslint";
import type { FormatConfig } from "oxfmt";
import { generateDifferences, showInvisibles } from "prettier-linter-helpers";
import { createSyncFn } from "synckit";

import type { formatCode } from "./worker.ts";

const formatSync = createSyncFn<typeof formatCode>(
  new URL("./worker.ts", import.meta.url),
);

export const rule: JSRuleDefinition<{
  RuleOptions: [{ formatOptions?: FormatConfig }?];
  MessageIds: "parseError" | "insert" | "delete" | "replace";
}> = {
  meta: {
    type: "layout",
    docs: {
      description: "MDX 코드 블록이 oxfmt로 포맷되어 있는지 검사합니다.",
    },
    fixable: "code",
    schema: [
      {
        type: "object",
        properties: { formatOptions: { type: "object" } },
        additionalProperties: false,
      },
    ],
    messages: {
      parseError: "코드 블록을 파싱할 수 없습니다: {{ reason }}",
      insert: "코드 블록 포맷: `{{ insert }}` 삽입",
      delete: "코드 블록 포맷: `{{ delete }}` 삭제",
      replace: "코드 블록 포맷: `{{ delete }}` → `{{ insert }}`",
    },
  },
  create(context) {
    const [options] = context.options;
    const { sourceCode } = context;

    return {
      Program() {
        const source = sourceCode.text;
        const result = formatSync(
          path.basename(context.filename),
          source,
          options?.formatOptions,
        );
        if (result.errors.length > 0) {
          context.report({
            loc: { line: 1, column: 0 },
            messageId: "parseError",
            data: { reason: result.errors[0] ?? "unknown error" },
          });
          return;
        }
        const code = source.replace(/\n$/, "");
        const formatted = result.code.replace(/\n$/, "");
        if (formatted === code) return;

        for (const difference of generateDifferences(code, formatted)) {
          const deleteText =
            difference.operation === "insert" ? "" : difference.deleteText;
          const insertText =
            difference.operation === "delete" ? "" : difference.insertText;
          const range: [number, number] = [
            difference.offset,
            difference.offset + deleteText.length,
          ];
          context.report({
            loc: {
              start: sourceCode.getLocFromIndex(range[0]),
              end: sourceCode.getLocFromIndex(range[1]),
            },
            messageId: difference.operation,
            data: {
              insert: showInvisibles(insertText),
              delete: showInvisibles(deleteText),
            },
            fix: (fixer) => fixer.replaceTextRange(range, insertText),
          });
        }
      },
    };
  },
};
