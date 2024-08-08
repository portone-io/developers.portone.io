// app.config.ts
import { readFile } from "node:fs/promises";
import path from "node:path";
import yaml from "@rollup/plugin-yaml";
import rehypeShiki from "@shikijs/rehype";
import { transformerMetaHighlight } from "@shikijs/transformers";
import { defineConfig } from "@solidjs/start/config";
import vinxiMdxPkg from "@vinxi/plugin-mdx";
import rehypeSlug from "rehype-slug";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import unocss from "unocss/vite";
import { imagetools } from "vite-imagetools";

// src/misc/contentIndex.ts
var indexFilesMapping = {
  blog: "blog/",
  "docs-en": "docs/en/",
  "docs-ko": "docs/ko/",
  "release-notes": "release-notes/(note)/"
};

// app.config.ts
var { default: vinxiMdx } = vinxiMdxPkg;
var app_config_default = defineConfig({
  server: {
    preset: "vercel",
    prerender: {
      routes: [
        ...Object.keys(indexFilesMapping).map(
          (fileName) => `/content-index/${fileName}.json`
        ),
        "/blog/rss.xml"
      ]
    }
  },
  extensions: ["ts", "tsx", "mdx"],
  vite: () => ({
    plugins: [
      yaml(),
      unocss(),
      // eslint-disable-next-line
      vinxiMdx.withImports({})({
        jsx: true,
        jsxImportSource: "solid-js",
        providerImportSource: "solid-mdx",
        remarkPlugins: [remarkFrontmatter, remarkGfm],
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
                  }
                },
                transformerMetaHighlight(),
                {
                  name: "line-number-meta",
                  code(node) {
                    if (this.options.meta?.__raw?.includes("showLineNumber")) {
                      this.addClassToHast(node, "line-numbers");
                    }
                  }
                },
                {
                  name: "title",
                  pre(node) {
                    const matches = /title="([^"]+)"/.exec(
                      this.options.meta?.__raw ?? ""
                    );
                    if (matches?.[1]) {
                      node.children.unshift({
                        type: "element",
                        tagName: "div",
                        properties: {
                          className: ["title"]
                        },
                        children: [{ type: "text", value: matches[1] }]
                      });
                    }
                  }
                }
              ]
            }
          ]
        ]
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
              ".svg"
            ].includes(extname)
          ) {
            return new URLSearchParams([
              ["as", "picture"],
              ["format", "webp"],
              ...url.searchParams.entries()
            ]);
          } else
            return url.searchParams;
        }
      }),
      {
        name: "base64-loader",
        async transform(_, id) {
          const [path2, query] = id.split("?");
          if (query !== "base64" || !path2)
            return null;
          const data = await readFile(path2);
          const base64 = data.toString("base64");
          return `export default '${base64}';`;
        }
      }
    ]
  }),
  solid: {
    exclude: ["./src/misc/opengraph/**/*"]
  }
});
export {
  app_config_default as default
};
