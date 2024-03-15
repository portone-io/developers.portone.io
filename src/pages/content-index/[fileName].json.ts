import type { APIRoute, GetStaticPaths } from "astro";
import * as yaml from "js-yaml";

import { toPlainText } from "~/misc/mdx";

export const prerender = true;

const indexFilesMapping = {
  blog: "blog/",
  "docs-en": "docs/en/",
  "docs-ko": "docs/ko/",
  "release-notes": "release-notes/",
} as const satisfies Record<string, string>;
type IndexFileName = keyof typeof indexFilesMapping;
const isIndexFileName = (value: string): value is IndexFileName =>
  value in indexFilesMapping;

export const getStaticPaths: GetStaticPaths = () =>
  Object.keys(indexFilesMapping).map((fileName) => ({
    params: { fileName },
  }));

export const GET: APIRoute = async ({ params }) => {
  const { fileName } = params;
  const slug =
    fileName && isIndexFileName(fileName) && indexFilesMapping[fileName];
  if (!slug) return new Response(null, { status: 404 });
  const entryMap = import.meta.glob("../../content/**/*.mdx", {
    query: "?raw",
  });
  const mdxTable = Object.fromEntries(
    (
      await Promise.all(
        Object.entries(entryMap).map(async ([path, importEntry]) => {
          const match = path.match(/\/content\/(.+)\.mdx$/);
          if (!match || !match[1]?.startsWith(slug)) return;
          const entry = await importEntry();
          if (
            !entry ||
            typeof entry !== "object" ||
            !("default" in entry) ||
            typeof entry.default !== "string"
          )
            return;

          const { frontmatter, md } = cutFrontmatter(entry.default);
          if (!frontmatter || typeof frontmatter !== "object") return;
          const entrySlug = String(
            "slug" in frontmatter ? frontmatter.slug : match[1],
          );
          return [entrySlug, { ...frontmatter, slug, md }] as const;
        }),
      )
    ).filter(Boolean),
  );
  const indexes = Object.values(mdxTable).map((mdx) => ({
    ...mdx,
    text: toPlainText(mdx.md),
  }));
  return new Response(JSON.stringify(indexes), {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

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
