import type { APIEvent } from "@solidjs/start/server";
import * as yaml from "js-yaml";
import { z } from "zod";

import { indexFilesMapping as _indexFilesMapping } from "~/misc/contentIndex";
import { toPlainText } from "~/misc/mdx";
import {
  getReleaseNoteDescription,
  getReleaseNoteTitle,
  makeReleaseNoteFrontmatter,
} from "~/misc/releaseNote";

export async function GET({ params }: APIEvent) {
  const fileName = z
    .enum(["ko", "en", "blog"])
    .safeParse(params.fileName?.replace(".json", "")).data;
  if (!fileName) return new Response(null, { status: 404 });
  const indexFilesMapping = _indexFilesMapping[fileName];
  const entryMap = import.meta.glob("~/routes/**/*.mdx", {
    query: "?raw",
  });
  const mdxTable = Object.fromEntries(
    await Promise.all(
      Object.entries(indexFilesMapping).map(
        async ([title, slug]) =>
          [title, await generateMdxTable(entryMap, slug)] as const,
      ),
    ),
  );
  return new Response(JSON.stringify(Object.values(mdxTable)), {
    headers: {
      "Content-Type": "application/json",
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
  return (
    await Promise.all(
      Object.entries(entryMap).map(async ([path, importEntry]) => {
        const match = path.match(/\/routes\/\(root\)\/(.+)\.mdx$/);
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
        const releaseNoteFrontmatter =
          "releasedAt" in frontmatter && frontmatter.releasedAt instanceof Date
            ? makeReleaseNoteFrontmatter(frontmatter.releasedAt, entrySlug)
            : {};
        return {
          ...frontmatter,
          slug: entrySlug,
          text: toPlainText(md),
          ...releaseNoteFrontmatter,
        } as const;
      }),
    )
  ).filter(Boolean);
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
