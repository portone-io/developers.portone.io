import * as path from "node:path";
import { defineConfig } from "astro/config";
import preact from "@astrojs/preact";
import solid from "@astrojs/solid-js";
import mdx from "@astrojs/mdx";
import unocss from "unocss/astro";

export default defineConfig({
  integrations: [
    preact({ compat: true }),
    solid(),
    mdx(),
    unocss(),
  ],
  vite: {
    resolve: {
      alias: {
        "~": path.resolve("./src/"),
      },
    },
  },
});
