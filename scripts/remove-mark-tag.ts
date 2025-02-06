import fs from "node:fs/promises";
import path from "node:path";

import fastGlob from "fast-glob";
import type {
  Root,
} from "mdast";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkMdx from "remark-mdx";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import stringWidth from "string-width";
import { unified } from "unified";
import { visit } from "unist-util-visit";

function migration() {
  return function (tree: Root) {
    visit(tree, "mdxJsxFlowElement", (node, index, parent) => {
      if (node.name === "mark" && parent !== undefined && index !== undefined) {
        parent.children.splice(index, 1, ...node.children);
      }
    });
    visit(tree, "mdxJsxTextElement", (node, index, parent) => {
      if(node.name === "mark") {
        console.log("node", node);
        console.log("parent", parent);
        console.log("index", index);
      }
      if (node.name === "mark" && parent !== undefined && index !== undefined) {
        parent.children.splice(index, 1, ...node.children);
      }
    });
  };
}

const files = await fastGlob("**/*.mdx", {
  cwd: path.resolve(import.meta.dirname, "../src/routes/(root)"),
  absolute: true,
  onlyFiles: true,
});

const processor = unified()
  .use(remarkParse)
  .use(remarkFrontmatter)
  .use(remarkMdx)
  .use(remarkGfm, { tableCellPadding: false, stringLength: stringWidth })
  .use(migration)
  .use(remarkStringify)
  .data("settings", {
    bullet: "-",
    rule: "-",
    emphasis: "_",
  });

await Promise.all(
  files.map(async (file) => {
    const content = await fs.readFile(file, "utf-8");
    const vFile = await processor.process(content);
    await fs.writeFile(file, vFile.toString());
  }),
);
