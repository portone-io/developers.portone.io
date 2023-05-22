import type { AstroConfig, AstroIntegration } from "astro";
import { readFile } from "node:fs/promises";
import { relative } from "node:path/posix";
import * as yaml from "js-yaml";

const integration: AstroIntegration = {
  name: "developers.portone.io:content-index",
  hooks: {
    "astro:config:setup": async ({ config, updateConfig }) => {
      updateConfig({ vite: { plugins: [vitePlugin(config)] } });
    },
  },
};

export default integration;

const table: { [slug: string]: string } = {};

function vitePlugin(config: AstroConfig) {
  const outDir = config.outDir.pathname;
  const root = config.root.pathname;
  return {
    name: "developers.portone.io:content-index",
    async transform(_: any, id: string) {
      const path = relative(root, id);
      const match = path.match(/^src\/content\/(.+)\.mdx$/);
      if (!match) return;
      const s = match[1];
      const { frontmatter, md } = cutFrontmatter(await readFile(id, "utf-8"));
      const slug = String(frontmatter?.slug || s);
      table[slug] = md;
      console.log({ slug, md });
    },
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        // if (req.url?.startsWith('/content-index/')) {
        //   //
        // }
        return next();
      });
    },
  };
}

interface CutFrontmatterResult {
  frontmatter: any;
  md: string;
}
function cutFrontmatter(md: string): CutFrontmatterResult {
  const match = md.match(
    /^---\r?\n((?:.|\r|\n)*?)\r?\n---\r?\n((?:.|\r|\n)*)$/
  );
  if (!match) return { frontmatter: {}, md };
  try {
    const fm = match[1] || "";
    const md = match[2] || "";
    const frontmatter = yaml.load(fm);
    return { frontmatter, md };
  } catch {
    return { frontmatter: {}, md };
  }
}
