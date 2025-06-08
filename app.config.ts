import { readFile } from "node:fs/promises";
import path from "node:path";

import remarkParamTree from "@portone-io/remark-param-tree";
import yaml from "@rollup/plugin-yaml";
import { withSentry } from "@sentry/solidstart";
import rehypeShiki, { type RehypeShikiOptions } from "@shikijs/rehype";
import { transformerMetaHighlight } from "@shikijs/transformers";
import { defineConfig } from "@solidjs/start/config";
import vinxiMdxPkg from "@vinxi/plugin-mdx";
import fastGlob from "fast-glob";
import rehypeSlug from "rehype-slug";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import { solidStartSiteMapPlugin } from "solid-start-sitemap";
import unocss from "unocss/vite";
import { imagetools } from "vite-imagetools";

// 현재 Vinxi export 설정 이슈로 파일을 직접 가져와야 함
import type { CustomizableConfig } from "./node_modules/vinxi/dist/types/lib/vite-dev";

const { default: vinxiMdx } = vinxiMdxPkg;

export default defineConfig(
  withSentry(
    {
      middleware: "./src/middleware.ts",
      server: {
        preset: "vercel",
        prerender: {
          routes: ["/blog/rss.xml"],
        },
        rollupConfig: {
          external: ["monaco-editor"],
        },
      },
      extensions: ["ts", "tsx", "mdx"],
      vite: () =>
        ({
          plugins: [
            yaml(),
            unocss(),
            vinxiMdx.withImports({})({
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
                          if (
                            this.options.meta?.__raw?.includes("showLineNumber")
                          ) {
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
              name: "base64-loader",
              async transform(_, id) {
                const [path, query] = id.split("?");
                if (query !== "base64" || !path) return null;
                const data = await readFile(path);
                const base64 = data.toString("base64");
                return `export default '${base64}';`;
              },
            },
            solidStartSiteMapPlugin({
              hostname: "https://developers.portone.io",
              ignoreRoutes: fastGlob
                .sync(["**/_components/**/*", "**/_preview/**/*"], {
                  cwd: "src/routes/(root)",
                })
                .map((path) => `/${path.replace(/\.[^/.]+$/, "")}`),
            }),
          ],
        }) satisfies CustomizableConfig,
      solid: {
        exclude: ["./src/misc/opengraph/**/*"],
      },
    },
    {
      org: "iamport-corp",
      project: "developers-portone-io",
      authToken: process.env?.VITE_SENTRY_AUTH_TOKEN,
      sourceMapsUploadOptions: {
        telemetry: false,
      },
    },
  ),
);
