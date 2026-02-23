import { readFile } from "node:fs/promises";
import path from "node:path";

import mdx from "@mdx-js/rollup";
import remarkParamTree from "@portone-io/remark-param-tree";
import yaml from "@rollup/plugin-yaml";
import rehypeShiki, { type RehypeShikiOptions } from "@shikijs/rehype";
import { transformerMetaHighlight } from "@shikijs/transformers";
import { solidStart } from "@solidjs/start/config";
import { nitroV2Plugin } from "@solidjs/vite-plugin-nitro-2";
import rehypeSlug from "rehype-slug";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import unocss from "unocss/vite";
import { defineConfig, withFilter } from "vite";
import { imagetools } from "vite-imagetools";

export default defineConfig({
  plugins: [
    {
      enforce: "pre",
      ...mdx({
        jsx: true,
        jsxImportSource: "solid-js",
        providerImportSource: "solid-mdx",
        remarkPlugins: [remarkFrontmatter, remarkGfm, remarkParamTree],
        rehypePlugins: [
          rehypeSlug,
          [
            rehypeShiki,
            {
              theme: "github-light",
              fallbackLanguage: "text",
              defaultLanguage: "text",
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
      }),
    },
    unocss(),
    solidStart({
      // middleware: "./src/middleware.ts",
      extensions: ["ts", "tsx", "mdx"],
      solid: {
        exclude: ["./src/misc/opengraph/**/*"],
      },
    }),
    nitroV2Plugin({
      preset: "vercel",
      prerender: {
        routes: ["/blog/rss.xml"],
      },
      rollupConfig: {
        external: ["monaco-editor"],
      },
    }),
    yaml(),
    withFilter(
      imagetools({
        defaultDirectives: (url) => {
          const extname = path.extname(url.pathname);
          if (
            // formats supported by Sharp (https://sharp.pixelplumbing.com/#formats)
            [
              ".png",
              ".jpg",
              ".jpeg",
              ".webp",
              ".gif",
              ".avif",
              ".tiff",
              ".tif",
              ".svg",
            ].includes(extname)
          ) {
            return new URLSearchParams([
              ["as", "picture"],
              ["format", "webp"],
              ...url.searchParams.entries(),
            ]);
          } else return url.searchParams;
        },
      }),
      {
        load: {
          id: {
            include: /^[^?]+\.(avif|gif|heif|jpeg|jpg|png|tiff|webp)(\?.*)?$/,
            exclude: "./public/**/*",
          },
        },
      },
    ),
    {
      name: "base64-loader",
      async transform(_, id) {
        const [path, query] = id.split("?");
        if (query !== "base64" || !path) return null;
        const data = await readFile(path);
        const base64 = data.toString("base64");
        return `export default '${base64}';`;
      },
    },
  ],
});
