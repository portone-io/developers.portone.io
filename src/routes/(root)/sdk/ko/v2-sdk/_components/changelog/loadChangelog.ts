"use server";

import { query } from "@solidjs/router";
import type { Root } from "mdast";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import type { Plugin } from "unified";
import { unified } from "unified";
import { visit } from "unist-util-visit";

export const loadChangelog = query(async () => {
  "use server";
  const response = await fetch(
    "https://api.github.com/repos/portone-io/browser-sdk/contents/packages/browser-sdk/CHANGELOG.md",
    {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${process.env.GITHUB_JS_SDK_CHANGELOG_TOKEN}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    },
  );
  const json = (await response.json()) as { content: string };
  const content = Buffer.from(json.content, "base64").toString("utf-8");
  const html = await unified()
    .use(remarkGfm)
    .use(remarkParse)
    .use(function () {
      return (tree) => {
        visit(tree, "heading", (node, index, parent) => {
          if (index == null || parent == null || node.depth !== 1) return;
          if (
            node.children.every(
              (child) =>
                child.type === "text" &&
                child.value.includes("@portone/browser-sdk"),
            )
          ) {
            parent.children.splice(index, 1);
            visit(parent, "text", (node) => {
              node.value = node.value.replaceAll(/^[0-9a-f]+: /g, "");
            });
          } else {
            console.warn("Unexpected CHANGELOG.md structure");
          }
        });
      };
    } satisfies Plugin<[], Root>)
    .use(remarkRehype)
    .use(rehypeStringify)
    .process(content);
  return html.value as string;
}, "docs/v2-payments/v2-sdk/changelog");
