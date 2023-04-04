import * as path from "node:path";
import { defineConfig } from "astro/config";
import preact from "@astrojs/preact";
import mdx from "@astrojs/mdx";
import unocss from "unocss/astro";

export default defineConfig({
  integrations: [
    preact({ compat: true }),
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
