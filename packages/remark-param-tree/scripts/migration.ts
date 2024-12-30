import fs from "node:fs/promises";
import path from "node:path";

import fastGlob from "fast-glob";
import type {
  Heading,
  ListItem,
  Paragraph,
  PhrasingContent,
  Root,
} from "mdast";
import { fromMarkdown } from "mdast-util-from-markdown";
import { toString } from "mdast-util-to-string";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkMdx from "remark-mdx";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import stringWidth from "string-width";
import { match, P } from "ts-pattern";
import { unified } from "unified";
import { SKIP, visit } from "unist-util-visit";

type TypeDefinition = {
  name: string;
  type: string;
  optional: boolean;
};

function migration() {
  return function (tree: Root) {
    visit(tree, "mdxJsxFlowElement", (node) => {
      if (node.name === "ParamTree") {
        const isNonEmptyTextNode = (child: PhrasingContent) =>
          match(child)
            .with(
              {
                type: "text",
                value: P.when((value) => value.trim() === ""),
              },
              () => false,
            )
            .otherwise(() => true);
        const generateTypeDefinition = (node: Paragraph | Heading) =>
          match(node)
            .with(
              {
                children: [
                  { type: P.not(P.union("inlineCode", "strong")) },
                  ...P.array(),
                ],
              },
              () => null,
            )
            .with(
              {
                children: [
                  { type: P.union("inlineCode", "strong") },
                  {
                    type: "mdxJsxTextElement",
                    name: "mark",
                  },
                ],
              },
              (typeDefinition) => {
                return {
                  name: toString(typeDefinition.children[0]),
                  type: toString(typeDefinition.children[1]),
                  optional: true,
                } satisfies TypeDefinition;
              },
            )
            .with(
              {
                children: [
                  { type: P.union("inlineCode", "strong") },
                  {
                    type: "mdxJsxTextElement",
                    name: "mark",
                  },
                  {
                    type: "mdxJsxTextElement",
                    name: "mark",
                  },
                ],
              },
              (typeDefinition) => {
                return {
                  name: toString(typeDefinition.children[0]),
                  type: toString(typeDefinition.children[2]),
                  optional: false,
                } satisfies TypeDefinition;
              },
            )
            .otherwise(() => {
              // console.log(workingFile, toString(listItem.children[0]));
              return null;
            });
        const transformNode = (node: ListItem | Heading) => {
          match(node)
            .with(
              {
                type: "listItem",
                children: [{ type: "paragraph" }, ...P.array()],
              },
              (node) => {
                node.children[0].children =
                  node.children[0].children.filter(isNonEmptyTextNode);
                const typeDefinition = generateTypeDefinition(node.children[0]);
                if (typeDefinition) {
                  node.children[0] = fromMarkdown(
                    `${typeDefinition.name}${typeDefinition.optional ? "?" : ""}: ${typeDefinition.type}`,
                    "utf-8",
                  ).children[0] as Paragraph;
                }
              },
            )
            .with({ type: "heading" }, (node) => {
              node.children = node.children.filter(isNonEmptyTextNode);
              const typeDefinition = generateTypeDefinition(node);
              if (typeDefinition) {
                node.children = fromMarkdown(
                  `${typeDefinition.name}${typeDefinition.optional ? "?" : ""}: ${typeDefinition.type}`,
                  "utf-8",
                ).children as PhrasingContent[];
              }
            })
            .otherwise(() => null);
          if (!node) {
            return;
          }
        };
        visit(node, "listItem", transformNode);
        visit(node, "heading", transformNode);
        return SKIP;
      }
      return;
    });
  };
}

const files = await fastGlob("**/*.mdx", {
  cwd: path.resolve(import.meta.dirname, "../../../src/routes/(root)"),
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
