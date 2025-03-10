import type { APIEvent } from "@solidjs/start/server";
import Fuse, { type FuseIndex } from "fuse.js";
import { match } from "ts-pattern";
import { z } from "zod";

import { type IndexFilesMapping } from "~/misc/contentIndex";
import type { SearchIndex } from "~/routes/content-index/[fileName]";
import { calcNavMenuSystemVersions } from "~/state/nav";
import { navMenu } from "~/state/server-only/nav";
import { Lang, SystemVersion } from "~/type";

const BEFORE_KEYWORD_TEXT_LENGTH = 50;

const createFuseInstance = ({
  searchIndex,
  fuseIndex,
}: {
  searchIndex: SearchIndex[];
  fuseIndex: FuseIndex<SearchIndex>;
}) => {
  return new Fuse(
    searchIndex,
    {
      keys: [
        { name: "title", weight: 3 },
        { name: "description", weight: 2 },
        { name: "text", weight: 1 },
      ],
      minMatchCharLength: 2,
      includeMatches: true,
      distance: 600,
    },
    fuseIndex,
  );
};

const getSearchIndex = async (index: keyof IndexFilesMapping) => {
  const res = await fetch(`/content-index/${index}.json`);
  return (await res.json()) as {
    searchIndex: SearchIndex[];
    fuseIndex: FuseIndex<SearchIndex>;
  };
};

const searchFuseKo = getSearchIndex("ko").then(createFuseInstance);
const searchFuseBlog = getSearchIndex("blog").then(createFuseInstance);

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
