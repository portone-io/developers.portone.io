import * as path from "node:path";
import { defineConfig } from "astro/config";
import preact from "@astrojs/preact";
import mdx from "@astrojs/mdx";
import vercel from "@astrojs/vercel/serverless";
import unocss from "unocss/astro";
import yaml from "@rollup/plugin-yaml";
import rehypeShiki, { type RehypeShikiOptions } from "@shikijs/rehype";
import {
  transformerMetaHighlight,
  transformerRemoveLineBreak,
} from "@shikijs/transformers";
import contentIndex from "./src/content-index";

// https://astro.build/config
export default defineConfig({
  integrations: [preact({ compat: true }), mdx(), unocss(), contentIndex],
  vite: {
    resolve: {
      alias: {
        "~": path.resolve("./src/"),
        querystring: "querystring-es3",
      },
    },
    plugins: [yaml()],
  },
  image: {
    remotePatterns: [{ protocol: "https" }],
  },
  markdown: {
    syntaxHighlight: false,
    rehypePlugins: [
      [
        rehypeShiki,
        {
          theme: "github-light",
          transformers: [
            {
              name: "remove-trailing-newline",
              preprocess(code) {
                if (code.endsWith("\n")) {
                  return code.slice(0, -1);
                }
                return code;
              },
            },
            transformerMetaHighlight(),
            {
              name: "line-number-meta",
              code(node) {
                if (this.options.meta?.__raw?.includes("showLineNumber")) {
                  this.addClassToHast(node, "line-numbers");
                }
              },
            },
            {
              name: "title",
              pre(node) {
                const matches = /title="([^"]+)"/.exec(
                  this.options.meta?.__raw ?? "",
                );
                if (matches?.[1]) {
                  node.children.unshift({
                    type: "element",
                    tagName: "div",
                    properties: {
                      className: ["title"],
                    },
                    children: [{ type: "text", value: matches[1] }],
                  });
                }
              },
            },
          ],
        } satisfies RehypeShikiOptions,
      ],
    ],
  },
  output: "hybrid",
  adapter: vercel(),
});
