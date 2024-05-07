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
} from "../utils.js";

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
    const options = context.options[0] as unknown;
    const redirects: Map<string, string> =
      options &&
      typeof options === "object" &&
      "redirects" in options &&
      options.redirects &&
      typeof options.redirects === "object"
        ? new Map<string, string>(Object.entries(options.redirects))
        : new Map<string, string>();
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
