import type { ESLint, Rule } from "eslint";

import {
  lintYaml,
  navLocalLinksValid,
  redirLocalLinksValid,
  type YamlRule,
} from "./yaml/index.ts";

function createRule(rule: YamlRule, description: string): Rule.RuleModule {
  return {
    meta: {
      type: "problem",
      docs: { description },
      schema: [],
    },
    create(context) {
      return {
        Program() {
          let messages;
          try {
            messages = lintYaml(
              context.sourceCode.text,
              context.physicalFilename,
              rule,
            );
          } catch (error) {
            const reason =
              error instanceof Error ? error.message : String(error);
            context.report({
              loc: { line: 1, column: 0 },
              message: `YAML을 처리할 수 없습니다: ${reason}`,
            });
            return;
          }
          for (const message of messages) {
            context.report({
              loc: {
                start: { line: message.line, column: message.column - 1 },
                end: { line: message.endLine, column: message.endColumn - 1 },
              },
              message: message.message,
            });
          }
        },
      };
    },
  };
}

export const eslintPlugin: ESLint.Plugin = {
  meta: { name: "@portone-io/lint-local-links-valid" },
  rules: {
    nav: createRule(
      navLocalLinksValid,
      "`_nav.yaml`에 적힌 문서 링크가 유효한지 검사합니다.",
    ),
    redir: createRule(
      redirLocalLinksValid,
      "`_redir.yaml`에 적힌 리다이렉트 링크가 유효한지 검사합니다.",
    ),
  },
};
