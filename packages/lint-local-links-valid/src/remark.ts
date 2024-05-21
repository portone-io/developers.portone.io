import path from "node:path";

import { lintRule, type Node } from "unified-lint-rule";
import { visit } from "unist-util-visit";
import * as YAML from "yaml";

import { isLocalLink, isMarkdownExists, resolveRedirect } from "./utils.js";

interface Options {
  baseDir: string;
  excludePaths: string[];
  redirects: Map<string, string>;
}
export const remarkLintLocalLinksValid = lintRule(
  "remark-lint:local-links-valid",
  async (tree, file, options: Partial<Options>) => {
    const workingFile = path.resolve(file.cwd, file.history[0] ?? "");
    const workingDir = path.dirname(
      // https://github.com/portone-io/developers.portone.io/issues/453
      ["index.mdx", "index.md"].includes(path.basename(workingFile))
        ? path.resolve(workingFile, "..")
        : workingFile,
    );
    const checkLink = initLinter(workingDir, options as Options);
    const tasks: Promise<void>[] = [];
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
                  const task = checkLink(
                    path.isAbsolute(link) ? path.join("/docs", link) : link,
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
                  tasks.push(task);
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
        const task = checkLink(node.url, (reason) => {
          file.message(reason, node);
        });
        tasks.push(task);
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
            const task = checkLink(
              path.isAbsolute(link) ? path.join("/docs", link) : link,
              (reason) => {
                file.message(reason, attr as Node);
              },
            );
            tasks.push(task);
          }
        }
      }
    });
    await Promise.all(tasks);
  },
);
const initLinter = (workingDir: string, options: Partial<Options>) => {
  if (!options.baseDir) {
    throw new Error("Missing required option `baseDir`");
  }
  const baseDir = path.resolve(options.baseDir);
  const excludePaths =
    options.excludePaths?.map((p) => path.join(baseDir, p)) ?? [];
  const redirects = new Map(
    Object.entries(options.redirects ?? {}).map(([from, to]) => {
      return [String(from), String(to)].map((link) =>
        isLocalLink(link) ? path.join(baseDir, link) : link,
      );
    }) as [string, string][],
  );
  return async function checkLink(
    link: string,
    message: (reason: string) => void,
  ): Promise<void> {
    if (!isLocalLink(link)) {
      return;
    }
    const url = link.split(/[#?]/)[0] ?? "";
    let absPath = "";
    if (path.isAbsolute(url)) {
      absPath = path.join(baseDir, url);
    } else {
      absPath = path.join(workingDir, url);
    }
    const resolvedPath = resolveRedirect(redirects, absPath);
    return isMarkdownExists(resolvedPath, excludePaths, message);
  };
};
