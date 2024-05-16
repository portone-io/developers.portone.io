import { type CollectionEntry, getCollection } from "astro:content";

export interface ReleaseNote {
  slug: string;
  entry: CollectionEntry<"release-notes">;
}

export async function getReleaseNotes() {
  const docEntries = await getCollection("release-notes");
  const apiSdkNotes: ReleaseNote[] = [];
  const consoleNotes: ReleaseNote[] = [];
  const platformNotes: ReleaseNote[] = [];
  for (const entry of docEntries) {
    const slug = entry.slug;
    if (slug.startsWith("api-sdk")) apiSdkNotes.push({ slug, entry });
    else if (slug.startsWith("console")) consoleNotes.push({ slug, entry });
    else if (slug.startsWith("platform")) platformNotes.push({ slug, entry });
  }
  for (const notes of [apiSdkNotes, consoleNotes, platformNotes]) {
    notes.sort((a, b) => (a.slug > b.slug ? -1 : 1));
  }
  return { apiSdkNotes, consoleNotes, platformNotes };
}
