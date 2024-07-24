import FastGlob from "fast-glob";
import path from "path";
import { match, P } from "ts-pattern";
import type { AST } from "yaml-eslint-parser";

import {
  isFileExists,
  isLocalLink,
  isYAMLDocument,
  isYAMLScalar,
  resolvePathname,
  type RuleModule,
} from "../utils.js";

type Stack = {
  upper: Stack | null;
  node:
    | AST.YAMLSequence
    | AST.YAMLFlowSequence
    | AST.YAMLMapping
    | AST.YAMLFlowMapping
    | AST.YAMLPair;
  redirects: Map<string, string>;
  tasks: (() => void)[];
  from?: AST.YAMLScalar;
  to?: AST.YAMLScalar;
};

export const rule: RuleModule = {
  meta: {
    type: "problem",
    messages: {
      invalidKey: "Pair 키는 'old' 또는 'new' 이어야 합니다.",
      invalidLocalLink: "로컬 링크는 '/' 로 시작해야 합니다.",
      missingOldLink: "'old' 링크를 찾을 수 없습니다.",
      missingNewLink: "'new' 링크를 찾을 수 없습니다.",
      duplicateRedirect: "리다이렉트가 중복되었습니다.",
    },
    schema: [],
    docs: {
      description: "Validate local links in `_redir.yaml`",
    },
    fixable: "code",
  },
  create(context) {
    const { name: filename, dir: baseDir } = path.parse(
      context.physicalFilename,
    );
    if (filename !== "_redir") return {};

    const files = new Set(
      FastGlob.sync("**/*", { cwd: baseDir }).map(resolvePathname),
    );
    let stack: Stack | null = null;
    function downStack(
      node: AST.YAMLSequence | AST.YAMLMapping | AST.YAMLPair,
    ): void {
      stack = {
        upper: stack,
        node,
        redirects: stack?.redirects ?? new Map<string, string>(),
        tasks: stack?.tasks ?? [],
      };
    }
    function upStack(): void {
      stack = stack && stack.upper;
    }
    return {
      YAMLSequence(node: AST.YAMLSequence): void {
        if (isYAMLDocument(node.parent)) {
          downStack(node);
        }
      },
      YAMLMapping(node: AST.YAMLMapping) {
        if (stack && node.parent === stack.node) {
          downStack(node);
        }
      },
      YAMLPair(node: AST.YAMLPair) {
        if (stack && node.parent === stack.node) {
          if (
            isYAMLScalar(node.key) &&
            ["old", "new"].includes(String(node.key.value))
          ) {
            if (isYAMLScalar(node.value)) {
              if (isLocalLink(String(node.value.value))) {
                const link = String(node.value.value).split(/[#?]/)[0] ?? "";
                if (!path.isAbsolute(link)) {
                  context.report({
                    loc: node.value.loc,
                    messageId: "invalidLocalLink",
                  });
                }
              }
              switch (node.key.value) {
                case "old":
                  stack.from = node.value;
                  break;
                case "new":
                  stack.to = node.value;
                  break;
              }
            } else {
              context.report({
                loc: node.value?.loc ?? node.loc,
                messageId: "invalidLocalLink",
              });
            }
          } else {
            context.report({
              loc: node.key?.loc ?? node.loc,
              messageId: "invalidKey",
            });
          }
        }
      },
      "YAMLMapping:exit": (node: AST.YAMLMapping) => {
        if (!stack) return;
        const fromLink = stack.from?.value;
        const toLink = stack.to?.value;

        match([stack, [fromLink, toLink]])
          .with(
            [P._, [P.string, P.string]],
            ([stack, [_fromLink, _toLink]]) => {
              const fromLink = _fromLink.split(/[#?]/)[0] ?? "";
              const toLink = _toLink.split(/[#?]/)[0] ?? "";
              if (stack.redirects.has(fromLink)) {
                context.report({
                  loc: stack.node.loc,
                  messageId: "duplicateRedirect",
                });
              }
              stack.redirects.set(fromLink, toLink);
              stack.tasks.push(() => {
                if (!isLocalLink(toLink)) return;
                if (stack.redirects.has(toLink)) return;
                isFileExists(toLink, [], files, (reason) => {
                  context.report({
                    loc: stack.node.loc,
                    message: reason,
                  });
                });
              });
            },
          )
          .with([P._, [P.any, P.any]], ([_, [fromLink, toLink]]) => {
            if (!fromLink) {
              context.report({
                loc: node.loc,
                messageId: "missingOldLink",
              });
            }
            if (!toLink) {
              context.report({
                loc: node.loc,
                messageId: "missingNewLink",
              });
            }
          })
          .exhaustive();
        upStack();
      },
      "YAMLSequence:exit": () => {
        if (!stack) return;
        stack.tasks.forEach((task) => task());
        upStack();
      },
    };
  },
};

const plugin = {
  rules: { "local-links-valid": rule },
};

export default plugin;
