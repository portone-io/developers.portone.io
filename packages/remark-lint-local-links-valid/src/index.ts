import fs from "node:fs/promises";
import path from "node:path";

import { lintRule } from "unified-lint-rule";
import { visit } from "unist-util-visit";

interface LintOptions {
  baseDir: string;
  excludePaths?: string[];
  redirects?: Record<string, string>;
}

const remarkLintLocalLinksValid = lintRule(
  "remark-lint:local-links-valid",
  async (tree, file, options: Partial<LintOptions>) => {
    if (!options.baseDir) {
      throw new Error("Missing required option `baseDir`");
    }
    const baseDir = path.resolve(options.baseDir);
    const filePath = path.resolve(file.cwd, file.history[0] || "");
    const excludePaths =
      options.excludePaths?.map((p) => path.join(baseDir, p)) || [];
    const redirects = options.redirects || {};

    const tasks: Promise<void>[] = [];
    visit(tree, (node) => {
      if (
        "url" in node &&
        typeof node.url === "string" &&
        node.type === "link" &&
        isLocalLink(node.url)
      ) {
        const url = node.url.split(/[#?]/)[0] || "";
        let absPath: string = "";
        if (path.isAbsolute(url)) {
          absPath = path.join(baseDir, url);
        } else {
          absPath = path.join(path.dirname(filePath), url);
        }
        const resolvedPath = resolveRedirect(
          redirects,
          path.relative(baseDir, absPath),
        );
        if (isLocalLink(resolvedPath) === false) {
          return;
        }
        absPath = path.join(baseDir, resolvedPath);
        if (excludePaths.some((p) => absPath.startsWith(p))) {
          return;
        }
        if (path.extname(absPath) !== "") {
          file.message("Local link should not have an extension", node);
          return;
        }
        const task: Promise<void> = Promise.any(
          [".md", ".mdx"].map((ext) => fs.access(absPath + ext)),
        ).catch(() => {
          file.message(`File not found: ${absPath}`, node);
        });
        tasks.push(task);
      }
    });
    await Promise.all(tasks);
  },
);

const isLocalLink = (url: string): boolean => {
  return !url.includes(":");
};

const resolveRedirect = (
  redirects: Record<string, string>,
  url: string,
): string => {
  let resolved = url;
  while (redirects[resolved]) {
    resolved = redirects[resolved].split(/[#?]/)[0];
  }
  return resolved;
};

export default remarkLintLocalLinksValid;
