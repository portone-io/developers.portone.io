import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as posixPath from "node:path/posix";

import { computed, effect, signal } from "@preact/signals";
import type { AstroConfig, AstroIntegration } from "astro";
import * as yaml from "js-yaml";
import { debounce } from "lodash-es";

import { toPlainText } from "./misc/mdx";

const indexFilesMapping = {
  "blog/": "blog.json",
  "docs/en/": "docs-en.json",
  "docs/ko/": "docs-ko.json",
  "release-notes/": "release-notes.json",
} as const satisfies Record<string, string>;

const integration: AstroIntegration = {
  name: "developers.portone.io:content-index",
  hooks: {
    "astro:config:setup": ({ config, updateConfig }) => {
      updateConfig({ vite: { plugins: [vitePlugin(config)] } });
    },
    "astro:config:done": ({ config }) => {
      const clientOut = config.build.client.pathname.replace(/^\/(\w:)/, "$1");
      const contentIndexDir = path.resolve(clientOut, "content-index");
      effect(() => {
        const indexFiles = indexFilesSignal.value;
        if (!indexFiles) return;
        void fs.mkdir(contentIndexDir, { recursive: true }).then(() => {
          for (const [filename, indexFile] of Object.entries(indexFiles)) {
            const indexFilePath = path.resolve(contentIndexDir, filename);
            void fs.writeFile(indexFilePath, indexFile);
          }
        });
      });
    },
  },
};

export default integration;

function vitePlugin(config: AstroConfig) {
  const root = config.root.pathname.replace(/^\/(\w:)/, "$1");
  return {
    name: "developers.portone.io:content-index",
    async transform(_, id) {
      const path = posixPath.relative(root, id);
      const match = path.match(/^src\/content\/(.+)\.mdx$/);
      if (!match) return;
      const { frontmatter, md } = cutFrontmatter(
        await fs.readFile(id, "utf-8"),
      );
      if (!frontmatter || typeof frontmatter !== "object") return;
      const slug = String("slug" in frontmatter ? frontmatter.slug : match[1]);
      updateMdxTable(slug, { ...frontmatter, slug, md });
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith("/content-index/")) return next();
        const filename = req.url.slice("/content-index/".length);
        const indexFiles = indexFilesSignal.value;
        if (!(filename in indexFiles)) return next();
        return res
          .setHeader("Content-Type", "application/json")
          .end(indexFiles[filename]);
      });
    },
  } satisfies NonNullable<AstroConfig["vite"]["plugins"]>[number];
}

interface CutFrontmatterResult {
  frontmatter: unknown;
  md: string;
}
function cutFrontmatter(md: string): CutFrontmatterResult {
  const match = md.match(
    /^---\r?\n((?:.|\r|\n)*?)\r?\n---\r?\n((?:.|\r|\n)*)$/,
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
}
interface MdxTable {
  [slug: string]: Mdx;
}
const mdxTableSignal = signal<MdxTable>({});
function updateMdxTable(slug: string, mdx: Mdx) {
  const mdxTable = mdxTableSignal.value;
  if (mdxEq(mdxTable[slug], mdx)) return;
  mdxTableSignal.value = { ...mdxTable, [slug]: mdx };
}
function mdxEq(a?: Mdx, b?: Mdx): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  if (a.slug !== b.slug) return false;
  for (const key in a)
    if (a[key as keyof Mdx] !== b[key as keyof Mdx]) return false;
  return true;
}
type Index = IndexItem[];
interface IndexItem {
  slug: string;
  text: string;
}
const indexSignal = signal<Index>([]);
const updateIndexSignal = debounce((mdxTable: MdxTable) => {
  indexSignal.value = Object.values(mdxTable).map((mdx) => ({
    ...mdx,
    text: toPlainText(mdx.md),
  }));
}, 500);
const indexFilesSignal = computed(() => {
  const index = indexSignal.value;
  const result: Record<string, Index> = {};
  index: for (const item of index) {
    for (const [slugPrefix, file] of Object.entries(indexFilesMapping)) {
      if (item.slug.startsWith(slugPrefix)) {
        (result[file] ??= []).push(item);
        continue index;
      }
    }
  }
  return Object.fromEntries(
    Object.entries(result).map(([filename, index]) => [
      filename,
      JSON.stringify(index),
    ]),
  );
});

effect(() => {
  const mdxTable = mdxTableSignal.value;
  updateIndexSignal(mdxTable);
});
