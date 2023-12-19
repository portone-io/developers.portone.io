import { type CollectionEntry, getCollection } from "astro:content";

export interface ReleaseNote {
  slug: string;
  entry: CollectionEntry<"release-notes">;
}

export async function getReleaseNotes() {
  const docEntries = await getCollection("release-notes");
  const apiSdkNotes: ReleaseNote[] = [];
  const consoleNotes: ReleaseNote[] = [];
  for (const entry of docEntries) {
    const slug = entry.slug;
    if (slug.startsWith("api-sdk")) apiSdkNotes.push({ slug, entry });
    else if (slug.startsWith("console")) consoleNotes.push({ slug, entry });
  }
  apiSdkNotes.sort((a, b) => (a.slug > b.slug ? -1 : 1));
  consoleNotes.sort((a, b) => (a.slug > b.slug ? -1 : 1));
  return { apiSdkNotes, consoleNotes };
}
