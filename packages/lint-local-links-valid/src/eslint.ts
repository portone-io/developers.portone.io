import fs from "node:fs";
import path from "node:path";

import type { Rule } from "eslint";
import type { RuleListener } from "eslint-plugin-yml/lib/types.js";
import { match, P } from "ts-pattern";
import type { AST } from "yaml-eslint-parser";

import { isLocalLink } from "./utils.ts";

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

interface RuleModule {
  meta: Rule.RuleMetaData;
  create(context: Rule.RuleContext): RuleListener;
}

export const rule: RuleModule = {
  meta: {
    type: "problem",
    messages: {
      invalidKey: "Key should be 'old' or 'new'",
      invalidLocalLink: "Local link should start with '/'",
      missingOldLink: "Missing 'old' link",
      missingNewLink: "Missing 'new' link",
      localLinkWithExtension: "Local link should not have an extension",
      fileNotFound: "File not found: {{resolvedPath}}",
    },
    schema: [],
    docs: {
      description: "Validate local links in `_redir.yml`",
    },
    fixable: "code",
  },
  create(context) {
    const { name: filename, dir: baseDir } = path.parse(
      context.physicalFilename,
    );
    if (filename !== "_redir") return {};
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
              stack.redirects.set(fromLink, toLink);
              stack.tasks.push(() => {
                if (!isLocalLink(toLink)) return;
                if (stack.redirects.has(toLink)) return;
                const absPath = path.join(baseDir, toLink);
                if (path.extname(absPath) !== "") {
                  context.report({
                    loc: stack.node.loc,
                    messageId: "localLinkWithExtension",
                  });
                }
                const exists = [".md", ".mdx"].some((ext) =>
                  fs.existsSync(absPath + ext),
                );
                if (!exists) {
                  context.report({
                    loc: stack.node.loc,
                    messageId: "fileNotFound",
                    data: { resolvedPath: absPath },
                  });
                }
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
  rules: { "redir-local-links-valid": rule },
};

function isYAMLDocument(
  node: AST.YAMLNode | null | undefined,
): node is AST.YAMLDocument {
  return node !== null && node !== undefined && node.type === "YAMLDocument";
}

function isYAMLScalar(
  node: AST.YAMLNode | null | undefined,
): node is AST.YAMLScalar {
  return node !== null && node !== undefined && node.type === "YAMLScalar";
}

export default plugin;
