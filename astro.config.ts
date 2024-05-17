import { readFile } from "node:fs/promises";
import * as path from "node:path";

import mdx from "@astrojs/mdx";
import preact from "@astrojs/preact";
import vercel from "@astrojs/vercel/serverless";
import sitemap from "@inox-tools/sitemap-ext";
import yaml from "@rollup/plugin-yaml";
import rehypeShiki, { type RehypeShikiOptions } from "@shikijs/rehype";
import { transformerMetaHighlight } from "@shikijs/transformers";
import { defineConfig } from "astro/config";
import unocss from "unocss/astro";

// https://astro.build/config
export default defineConfig({
  site: "https://developers.portone.io/",
  integrations: [
    preact({ compat: true }),
    mdx(),
    unocss({ injectReset: true }),
    sitemap({
      customPages: ["/api/rest-v1/", "/api/rest-v2/"].map(
        (url) => `https://developers.portone.io${url}`,
      ),
    }),
  ],
  vite: {
    resolve: {
      alias: {
        "~": path.resolve("./src/"),
      },
    },
    plugins: [
      yaml(),
      {
        name: "base64-loader",
        async transform(_, id) {
          const [path, query] = id.split("?");
          if (query !== "base64") return null;
          const data = await readFile(path!);
          const base64 = data.toString("base64");
          return `export default '${base64}';`;
        },
      },
    ],
    optimizeDeps: { exclude: ["sharp"] },
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
  output: "server",
  adapter: vercel(),
});
