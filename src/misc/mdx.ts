import { fromMarkdown } from "mdast-util-from-markdown";
import { mdxFromMarkdown } from "mdast-util-mdx";
import { toString } from "mdast-util-to-string";
import { mdxjs } from "micromark-extension-mdxjs";

export function toPlainText(mdx: string): string {
  const ast = fromMarkdown(mdx, {
    extensions: [mdxjs()],
    mdastExtensions: [mdxFromMarkdown()],
  });
  ast.children = ast.children.filter((child) => child.type !== "mdxjsEsm");
  return toString(ast).replaceAll(/\s+/g, " ").trim();
}
