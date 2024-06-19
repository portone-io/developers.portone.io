import type { APIEvent } from "@solidjs/start/server";
import * as yaml from "js-yaml";

import { type IndexFileName, indexFilesMapping } from "~/misc/contentIndex";
import { toPlainText } from "~/misc/mdx";

export async function GET({ params }: APIEvent) {
  const fileName = params.fileName?.replace(".json", "");
  const slug =
    fileName &&
    fileName in indexFilesMapping &&
    indexFilesMapping[fileName as IndexFileName];
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
          return [
            entrySlug,
            { ...frontmatter, slug: entrySlug, text: toPlainText(md) },
          ] as const;
        }),
      )
    ).filter(Boolean),
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
