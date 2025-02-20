import type { APIEvent } from "@solidjs/start/server";
import Fuse from "fuse.js";
import * as yaml from "js-yaml";
import { match, P } from "ts-pattern";
import { z } from "zod";

import { indexFilesMapping as _indexFilesMapping } from "~/misc/contentIndex";
import { toPlainText } from "~/misc/mdx";
import { makeReleaseNoteFrontmatter } from "~/misc/releaseNote";
import { calcNavMenuSystemVersions } from "~/state/nav";
import { navMenu } from "~/state/server-only/nav";
import { Lang, SystemVersion } from "~/type";

const BEFORE_KEYWORD_TEXT_LENGTH = 50;

const makeSearchIndex = async (index: "ko" | "blog") => {
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

const createFuseInstance = (
  items: Awaited<ReturnType<typeof makeSearchIndex>>,
) => {
  return new Fuse(items, {
    keys: [
      { name: "title", weight: 3 },
      { name: "description", weight: 2 },
      { name: "text", weight: 1 },
    ],
    minMatchCharLength: 2,
    includeMatches: true,
    distance: 600,
  });
};

const searchFuseKo = makeSearchIndex("ko").then(createFuseInstance);
const searchFuseBlog = makeSearchIndex("blog").then(createFuseInstance);

export type SearchResult = [key: string, SearchResultItem[]];

export interface SearchResultItem {
  slug: string;
  title: string | undefined;
  description: string | undefined;
  contentDescription: string;
}

export async function GET(req: APIEvent) {
  "use server";
  const url = new URL(req.request.url);
  const q = z.string().parse(url.searchParams.get("q")).normalize("NFC").trim();
  const systemVersion = SystemVersion.parse(url.searchParams.get("v"));
  const lang = Lang.parse(url.searchParams.get("lang"));
  const indexParam = z
    .enum(["ko", "blog"])
    .parse(url.searchParams.get("searchIndex") ?? "ko");
  const navMenuSystemVersions = calcNavMenuSystemVersions(
    Object.values(navMenu[lang]).flat(),
  );

  const fuse = await match(indexParam)
    .with("ko", () => searchFuseKo)
    .with("blog", () => searchFuseBlog)
    .exhaustive();

  const results = Map.groupBy(fuse.search(q), ({ item }) => item.key)
    .entries()
    .map<SearchResult>(([key, value]) => {
      return [
        key,
        value
          .filter(({ item: { slug } }) => {
            const navMenuSystemVersion = navMenuSystemVersions[`/${slug}`];
            if (!navMenuSystemVersion) return true;
            return navMenuSystemVersion === systemVersion;
          })
          .slice(0, 3)
          .map(({ item }) => {
            const normalizedText = item.text;
            const keywordFirstIndex = Math.max(normalizedText.indexOf(q), 0);
            const textStartIndex =
              keywordFirstIndex >= BEFORE_KEYWORD_TEXT_LENGTH
                ? keywordFirstIndex - BEFORE_KEYWORD_TEXT_LENGTH
                : 0;
            const contentDescription = normalizedText.slice(
              textStartIndex,
              textStartIndex + 300,
            );

            return {
              slug: item.slug,
              title: item.title,
              description: item.description,
              contentDescription,
            };
          }),
      ];
    })
    .toArray();
  return Response.json(results, {
    headers: {
      "Cache-Control": "max-age=60",
      "CDN-Cache-Control": "max-age=31536000",
    },
  });
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
