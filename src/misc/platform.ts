import { type CollectionEntry, getCollection } from "astro:content";

export interface Document {
  slug: string;
  entry: CollectionEntry<"platform">;
}

export async function getPlatformDocuments() {
  const docEntries = await getCollection("platform");
  const usages: Document[] = [];
  const guides: Document[] = [];
  for (const entry of docEntries) {
    const slug = entry.slug;
    if (slug.startsWith("guides")) guides.push({ slug, entry });
    else if (slug.startsWith("usages")) usages.push({ slug, entry });
  }
  for (const notes of [usages, guides]) {
    notes.sort((a, b) => (a.entry.data.no < b.entry.data.no ? -1 : 1));
  }
  return { usages, guides };
}
