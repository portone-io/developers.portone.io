"use server";

import { cache } from "@solidjs/router";

import { platform } from "#content";
import type { PlatformEntry } from "~/content/config";

export interface Document {
  slug: string;
  entry: PlatformEntry;
}

// eslint-disable-next-line @typescript-eslint/require-await
export const loadPlatformDocuments = cache(async () => {
  const docEntries = Object.values(platform);
  const usages: Document[] = [];
  const guides: Document[] = [];
  for (const { slug, frontmatter } of docEntries) {
    if (slug.startsWith("guides")) guides.push({ slug, entry: frontmatter });
    else if (slug.startsWith("usages"))
      usages.push({ slug, entry: frontmatter });
  }
  for (const notes of [usages, guides]) {
    notes.sort((a, b) => (a.entry.no < b.entry.no ? -1 : 1));
  }
  return { usages, guides };
}, "platform/docs");
