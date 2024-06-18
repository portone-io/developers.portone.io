import { readFile } from "node:fs/promises";
import path from "node:path";

import yaml from "@rollup/plugin-yaml";
import { defineConfig } from "@solidjs/start/config";
import vinxiMdxPkg from "@vinxi/plugin-mdx";
import remarkFrontmatter from "remark-frontmatter";
import unocss from "unocss/vite";
import { imagetools } from "vite-imagetools";

// 현재 Vinxi export 설정 이슈로 파일을 직접 가져와야 함
import type { CustomizableConfig } from "./node_modules/vinxi/dist/types/lib/vite-dev";

const { default: vinxiMdx } = vinxiMdxPkg;

export default defineConfig({
  server: {
    preset: "vercel",
  },
  extensions: ["ts", "tsx", "mdx"],
  vite: () =>
    ({
      ssr: {
        optimizeDeps: {
          include: ["mixpanel-browser"],
        },
      },
      plugins: [
        yaml(),
        unocss(),
        // eslint-disable-next-line
        vinxiMdx.withImports({})({
          jsx: true,
          jsxImportSource: "solid-js",
          providerImportSource: "solid-mdx",
          remarkPlugins: [remarkFrontmatter],
        }),
        imagetools({
          defaultDirectives: (url) => {
            if (url.searchParams.has("imagetools")) {
              return new URLSearchParams({
                as: "picture",
                format: "avif;webp",
              });
            } else return new URLSearchParams({});
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
      ],
    }) satisfies CustomizableConfig,
  solid: {
    exclude: ["./src/misc/opengraph/**/*"],
  },
});
