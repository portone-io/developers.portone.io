import path from "node:path";

import fastGlob from "fast-glob";
import { lintRule, type Node } from "unified-lint-rule";
import { visit } from "unist-util-visit";
import * as YAML from "yaml";

import {
  isFileExists,
  isLocalLink,
  resolvePathname,
  resolveRedirect,
} from "./utils.js";

interface Options {
  baseDir: string;
  excludePaths: string[];
  redirects: Map<string, string>;
}

const files = new Set(
  (
    await fastGlob("**/*", {
      cwd: path.join(process.cwd(), "./src/routes/(root)"),
    })
  ).map(resolvePathname),
);

export const remarkLintLocalLinksValid = lintRule(
  "remark-lint:local-links-valid",
  (tree, file, options: Partial<Options>) => {
    const workingFile = path.resolve(file.cwd, file.history[0] ?? "");
    const checkLink = initLinter(workingFile, options as Options);
    visit(tree, (node) => {
      if (node.type === "yaml" && "value" in node) {
        try {
          const lineCounter = new YAML.LineCounter();
          const doc = YAML.parseDocument(String(node.value), {
            lineCounter,
          });
          const versionVariants = doc.getIn(["versionVariants"]);
          if (YAML.isMap(versionVariants)) {
            YAML.visit(versionVariants, {
              Pair(_, pair) {
                if (
                  YAML.isScalar(pair.value) &&
                  typeof pair.value.value === "string"
                ) {
                  const link = pair.value.value;
                  const range = pair.value.range;
                  checkLink(
                    path.isAbsolute(link) ? path.join("/opi", link) : link,
                    (reason) => {
                      if (node.position && range) {
                        const start = lineCounter.linePos(range[0]);
                        const end = lineCounter.linePos(range[1]);
                        file.message(reason, {
                          ...node,
                          position: {
                            start: {
                              line: node.position.start.line + start.line,
                              column: start.col,
                            },
                            end: {
                              line: node.position.start.line + end.line,
                              column: end.col,
                            },
                          },
                        });
                      } else {
                        file.message(reason, node);
                      }
                    },
                  );
                }
              },
            });
          }
        } catch (e) {
          file.message(String(e), node);
        }
      }
      if (
        "url" in node &&
        typeof node.url === "string" &&
        node.type === "link"
      ) {
        checkLink(node.url, (reason) => {
          file.message(reason, node);
        });
      }
      if (
        node.type === "mdxJsxFlowElement" &&
        "name" in node &&
        node.name === "ContentRef" &&
        "attributes" in node &&
        Array.isArray(node.attributes)
      ) {
        for (const _attr of node.attributes) {
          const attr = _attr as unknown;
          if (
            typeof attr === "object" &&
            attr !== null &&
            "type" in attr &&
            attr.type === "mdxJsxAttribute" &&
            "name" in attr &&
            attr.name === "slug" &&
            "value" in attr &&
            typeof attr.value === "string" &&
            "position" in attr
          ) {
            const link = attr.value;
            checkLink(
              path.isAbsolute(link) && !link.startsWith("/api")
                ? path.join("/opi", link)
                : link,
              (reason) => {
                file.message(reason, attr as Node);
              },
            );
          }
        }
      }
    });
  },
);
const initLinter = (workingFile: string, options: Partial<Options>) => {
  if (!options.baseDir) {
    throw new Error("Missing required option `baseDir`");
  }
  const baseDir = path.resolve(options.baseDir);
  const excludePaths = options.excludePaths ?? [];
  const redirects = new Map(
    Object.entries(options.redirects ?? {}).map(([from, to]) => {
      return [String(from), String(to)].map((link) =>
        isLocalLink(link) ? `/${link}` : link,
      );
    }) as [string, string][],
  );
  const workingPath = resolvePathname(path.relative(baseDir, workingFile));
  return function checkLink(
    link: string,
    message: (reason: string) => void,
  ): void {
    if (!isLocalLink(link)) return;
    const url = link.split(/[#?]/)[0] ?? "";
    const absPath = path.isAbsolute(url) ? url : path.join(workingPath, url);
    const resolvedPath = resolveRedirect(redirects, absPath);
    return isFileExists(resolvedPath, excludePaths, files, message);
  };
};
