import fs from "node:fs/promises";
import path from "node:path";

import { load } from "js-yaml";
import { lintRule } from "unified-lint-rule";
import { visit } from "unist-util-visit";

interface Options {
  baseDir: string;
  excludePaths: string[];
  redirects: Record<string, string>;
}
const remarkLintLocalLinksValid = lintRule(
  "remark-lint:local-links-valid",
  async (tree, file, options: Partial<Options>) => {
    if (!options.baseDir) {
      throw new Error("Missing required option `baseDir`");
    }
    const baseDir = path.resolve(options.baseDir);
    const filePath = path.resolve(file.cwd, file.history[0] ?? "");
    const excludePaths =
      options.excludePaths?.map((p) => path.join(baseDir, p)) ?? [];
    const redirects = Object.fromEntries(
      Object.entries(options.redirects ?? {}).map(([from, to]) => {
        return [from, to].map((link) =>
          isLocalLink(link) ? path.join(baseDir, link) : link,
        );
      }),
    ) as Record<string, string>;
    const tasks: Promise<void>[] = [];
    visit(tree, (node) => {
      if (node.type === "yaml" && "value" in node) {
        try {
          const yaml = load(node.value as string);
          if (isObject(yaml) && "versionVariants" in yaml) {
            const versionVariants = yaml["versionVariants"];
            if (isObject(versionVariants)) {
              for (const [_version, link] of Object.entries(versionVariants)) {
                if (typeof link === "string") {
                  const task = checkLink(
                    path.isAbsolute(link) ? path.join("/docs", link) : link,
                    (reason) => {
                      file.message(reason, node);
                    },
                  );
                  tasks.push(task);
                }
              }
            }
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
    });
    async function checkLink(
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
        absPath = path.join(path.dirname(filePath), url);
      }
      const resolvedPath = resolveRedirect(redirects, absPath);
      if (!isLocalLink(resolvedPath)) {
        return;
      }
      if (excludePaths.some((p) => resolvedPath.startsWith(p))) {
        return;
      }
      if (path.extname(resolvedPath) !== "") {
        message("Local link should not have an extension");
        return;
      }
      const task = Promise.any(
        [".md", ".mdx"].map((ext) => fs.access(resolvedPath + ext)),
      ).catch(() => {
        message(`File not found: ${resolvedPath}`);
      });
      return task;
    }
    await Promise.all(tasks);
  },
);
const isLocalLink = (url: string): boolean => {
  try {
    new URL(url);
  } catch {
    return true;
  }
  return false;
};
const resolveRedirect = (
  redirects: Record<string, string>,
  url: string,
): string => {
  let resolved = url;
  while (redirects[resolved]) {
    resolved = redirects[resolved]?.split(/[#?]/)[0] ?? resolved;
  }
  return resolved;
};
const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};
export default remarkLintLocalLinksValid;
