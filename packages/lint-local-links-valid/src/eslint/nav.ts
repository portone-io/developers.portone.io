import fs from "fs";
import path from "path";

import type { AST } from "yaml-eslint-parser";
import {
  isLocalLink,
  isYAMLPair,
  isYAMLScalar,
  isYAMLSequence,
  resolveRedirect,
  type RuleModule,
} from "../utils.ts";

export const rule: RuleModule = {
  meta: {
    type: "problem",
    messages: {
      fileNotFound: "File not found: {{resolvedPath}}",
    },
    schema: [
      {
        type: "object",
        properties: {
          redirects: {
            type: "object",
            patternProperties: {
              ".*": {
                type: "string",
              },
            },
            additionalProperties: false,
          },
        },
        additionalProperties: false,
      },
    ],
    docs: {
      description: "Validate local links in `_nav.yaml`",
    },
    fixable: "code",
  },
  create(context) {
    const { name: filename, dir } = path.parse(context.physicalFilename);
    const baseDir = path.resolve(dir, "..");
    const redirects =
      context.options[0] && context.options[0].redirects
        ? new Map(
            Object.entries(context.options[0].redirects) as [string, string][],
          )
        : new Map();
    if (filename !== "_nav") return {};
    return {
      YAMLScalar(node: AST.YAMLScalar) {
        let url: string | null = null;
        if (
          isYAMLSequence(node.parent) &&
          isYAMLPair(node.parent.parent) &&
          isYAMLScalar(node.parent.parent.key) &&
          node.parent.parent.key.value === "items" &&
          typeof node.value === "string"
        ) {
          url = node.value;
        }
        if (
          isYAMLPair(node.parent) &&
          node.parent.key !== node &&
          isYAMLScalar(node.parent.key) &&
          node.parent.key.value === "slug" &&
          typeof node.value === "string"
        ) {
          url = node.value;
        }
        if (url && isLocalLink(url)) {
          url = url.split(/[#?]/)[0] ?? "";
          const resolvedUrl = resolveRedirect(redirects, url);
          if (!isLocalLink(resolvedUrl)) return;
          const absPath = path.join(baseDir, resolvedUrl);
          const exists = [".md", ".mdx"].some((ext) =>
            fs.existsSync(absPath + ext),
          );
          if (!exists) {
            context.report({
              loc: node.loc,
              messageId: "fileNotFound",
              data: { resolvedPath: absPath },
            });
          }
        }
      },
    };
  },
};

const plugin = {
  rules: { "local-links-valid": rule },
};

export default plugin;
