import * as path from "node:path";
import { defineConfig } from "astro/config";
import preact from "@astrojs/preact";
import solid from "@astrojs/solid-js";
import mdx from "@astrojs/mdx";
import unocss from "unocss/astro";
import yaml from "@rollup/plugin-yaml";
import rehypePrettyCode, {
  Options as PrettyCodeOptions,
} from "rehype-pretty-code";

import contentIndex from "./src/content-index";

const prettyCodeOptions: Partial<PrettyCodeOptions> = {
  theme: "material-theme-lighter",
  onVisitLine(node) {
    if (node.children.length === 0) {
      node.children = [{ type: "text", value: " " }];
    }
  },
  onVisitHighlightedLine(node) {
    node.properties.className.push("highlighted");
  },
  onVisitHighlightedWord(node) {
    node.properties.className = ["word"];
  },
  tokensMap: {},
};

export default defineConfig({
  integrations: [
    preact({ compat: true }),
    solid(),
    mdx(),
    unocss(),
    contentIndex,
  ],
  vite: {
    resolve: {
      alias: {
        "~": path.resolve("./src/"),
      },
    },
    plugins: [yaml()],
  },
  markdown: {
    syntaxHighlight: false,
    rehypePlugins: [[rehypePrettyCode, prettyCodeOptions]],
  },
});
