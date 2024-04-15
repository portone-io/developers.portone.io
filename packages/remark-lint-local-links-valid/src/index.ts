import fs from "node:fs/promises";
import path from "node:path";

import { lintRule } from "unified-lint-rule";
import { visit } from "unist-util-visit";

interface LintOptions {
  baseDir: string;
}

const remarkLintLocalLinksValid = lintRule(
  "remark-lint:local-links-valid",
  async (tree, file, options: Partial<LintOptions>) => {
    if (!options.baseDir) {
      throw new Error("Missing required option `baseDir`");
    }
    const baseDir = path.resolve(options.baseDir);
    const filePath = path.resolve(file.cwd, file.history[0] || "");

    const tasks: Promise<void>[] = [];
    visit(tree, (node) => {
      if (
        "url" in node &&
        typeof node.url === "string" &&
        node.type === "link" &&
        !node.url.includes(":")
      ) {
        const url = node.url.split(/[#?]/)[0] || "";
        let absPath: string = "";
        if (path.isAbsolute(url)) {
          absPath = path.join(baseDir, url);
        } else {
          absPath = path.join(path.dirname(filePath), url);
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

export default remarkLintLocalLinksValid;
