import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as posixPath from "node:path/posix";
import type { AstroConfig, AstroIntegration } from "astro";
import { effect, signal } from "@preact/signals";
import { debounce } from "lodash-es";
import * as yaml from "js-yaml";
import Fuse from "fuse.js";
import { toPlainText } from "./misc/mdx";

const integration: AstroIntegration = {
  name: "developers.portone.io:content-index",
  hooks: {
    "astro:config:setup": async ({ config, updateConfig }) => {
      updateConfig({ vite: { plugins: [vitePlugin(config)] } });
    },
  },
};

export default integration;

function vitePlugin(config: AstroConfig) {
  const outDir = config.outDir.pathname.replace(/^\/(\w:)/, "$1");
  const root = config.root.pathname.replace(/^\/(\w:)/, "$1");
  effect(() => {
    const fuseIndex = fuseIndexSignal.value;
    if (!fuseIndex) return;
    fs.mkdir(outDir, { recursive: true }).then(() => {
      fs.writeFile(
        path.resolve(outDir, "content-index.json"),
        JSON.stringify(fuseIndex.toJSON())
      );
    });
  });
  return {
    name: "developers.portone.io:content-index",
    async transform(_: any, id: string) {
      const path = posixPath.relative(root, id);
      const match = path.match(/^src\/content\/(.+)\.mdx$/);
      if (!match) return;
      const { frontmatter, md } = cutFrontmatter(
        await fs.readFile(id, "utf-8")
      );
      const slug = String(frontmatter?.slug || match[1]);
      const title = String(frontmatter?.title || "");
      const description = String(frontmatter?.description || "");
      updateMdxTable(slug, { slug, md, title, description });
    },
    // configureServer(server: any) {
    //   server.middlewares.use(async (req: any, res: any, next: any) => {
    //     // if (req.url?.startsWith('/content-index/')) {
    //     //   //
    //     // }
    //     return next();
    //   });
    // },
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

interface Mdx {
  slug: string;
  md: string;
  title?: string;
  description?: string;
}
interface MdxTable {
  [slug: string]: Mdx;
}
const mdxTableSignal = signal<MdxTable>({});
function updateMdxTable(slug: string, mdx: Mdx) {
  const mdxTable = mdxTableSignal.value;
  if (mdxEq(mdxTable[slug]!, mdx)) return;
  mdxTableSignal.value = { ...mdxTable, [slug]: mdx };
}
function mdxEq(a?: Mdx, b?: Mdx): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return (
    a.slug === b.slug &&
    a.md === b.md &&
    a.title === b.title &&
    a.description === b.description
  );
}
const fuseIndexSignal = signal<Fuse.FuseIndex<Mdx> | undefined>(undefined);
const updateFuseIndexSignal = debounce((mdxTable: MdxTable) => {
  fuseIndexSignal.value = Fuse.createIndex(
    ["title", "description", "text"],
    Object.values(mdxTable).map((mdx) => ({
      ...mdx,
      text: toPlainText(mdx.md),
    }))
  );
}, 500);

effect(() => {
  const mdxTable = mdxTableSignal.value;
  updateFuseIndexSignal(mdxTable);
});
