import type { APIEvent } from "@solidjs/start/server";
import Fuse from "fuse.js";
import * as yaml from "js-yaml";
import { match, P } from "ts-pattern";
import { z } from "zod";

import { indexFilesMapping as _indexFilesMapping } from "~/misc/contentIndex";
import { toPlainText } from "~/misc/mdx";
import { makeReleaseNoteFrontmatter } from "~/misc/releaseNote";

export interface SearchIndex {
  key: string;
  slug: string;
  title?: string | undefined;
  description?: string | undefined;
  text: string;
}

const createSearchIndex = async (
  index: "ko" | "blog",
): Promise<SearchIndex[]> => {
  const indexFilesMapping = _indexFilesMapping[index];
  const entryMap = import.meta.glob("~/routes/**/*.mdx", {
    query: "?raw",
  });
  const mdxTable = Object.fromEntries(
    await Promise.all(
      Object.entries(indexFilesMapping).map(
        async ([title, slug]) =>
          [
            title.normalize("NFC"),
            await generateMdxTable(entryMap, slug),
          ] as const,
      ),
    ),
  );
  const searchIndex = Object.entries(mdxTable).flatMap(([key, value]) =>
    value.map((item) => {
      const slug = item.slug
        .replace(/\/index$/, "")
        .replace(/\/\([\w\d]+\)/, "");
      return { ...item, key, slug };
    }),
  );
  return searchIndex;
};

const searchIndexKo = createSearchIndex("ko");
const searchIndexBlog = createSearchIndex("blog");

export async function GET({ params }: APIEvent) {
  const fileName = z
    .enum(["ko", "blog"])
    .safeParse(params.fileName?.replace(".json", "")).data;
  if (!fileName) return new Response(null, { status: 404 });

  const searchIndex = await match(fileName)
    .with("ko", () => searchIndexKo)
    .with("blog", () => searchIndexBlog)
    .exhaustive();

  const fuseIndex = Fuse.createIndex(
    [
      { name: "title", weight: 3 },
      { name: "description", weight: 2 },
      { name: "text", weight: 1 },
    ],
    searchIndex,
  );

  return Response.json(
    { fuseIndex, searchIndex },
    {
      headers: {
        "Cache-Control": "max-age=60",
        "CDN-Cache-Control": "max-age=31536000",
      },
    },
  );
}

interface CutFrontmatterResult {
  frontmatter: unknown;
  md: string;
}
async function generateMdxTable(
  entryMap: Record<string, () => Promise<unknown>>,
  slug: string,
) {
  const newLocal = await Promise.all(
    Object.entries(entryMap)
      .filter(([path]) => !path.includes("_components"))
      .map(async ([path, importEntry]) => {
        const pathMatch = path.match(/\/routes\/\(root\)\/(.+)\.mdx$/);
        if (!pathMatch || !pathMatch[1]?.startsWith(slug)) return;
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

        const entrySlug = match(frontmatter)
          .with({ slug: P.string }, ({ slug }) => slug)
          .otherwise(() => pathMatch[1]);

        if (entrySlug === undefined) {
          return;
        }

        const releaseNoteFrontmatter = match(frontmatter)
          .with({ releasedAt: P.instanceOf(Date) }, ({ releasedAt }) =>
            makeReleaseNoteFrontmatter(releasedAt, entrySlug),
          )
          .otherwise(() => undefined);

        return {
          ...frontmatter,
          slug: entrySlug,
          text: toPlainText(md),
          ...releaseNoteFrontmatter,
        } as const;
      }),
  );
  return newLocal.filter(Boolean);
}

function cutFrontmatter(md: string): CutFrontmatterResult {
  const match = md
    .normalize("NFC")
    .match(/^---\r?\n((?:.|\r|\n)*?)\r?\n---\r?\n((?:.|\r|\n)*)$/);
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
