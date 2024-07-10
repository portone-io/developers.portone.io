import { cache } from "@solidjs/router";

import type { ReleaseNoteEntry } from "~/content/config";

export interface ReleaseNote {
  slug: string;
  entry: ReleaseNoteEntry;
}

export const getReleaseNotes = cache(async () => {
  "use server";

  const { releaseNotes } = await import("#content");

  const apiSdkNotes: ReleaseNote[] = [];
  const consoleNotes: ReleaseNote[] = [];
  const platformNotes: ReleaseNote[] = [];
  for (const [slug, { frontmatter: entry }] of Object.entries(releaseNotes)) {
    if (slug.startsWith("api-sdk")) apiSdkNotes.push({ slug, entry });
    else if (slug.startsWith("console")) consoleNotes.push({ slug, entry });
    else if (slug.startsWith("platform")) platformNotes.push({ slug, entry });
  }
  for (const notes of [apiSdkNotes, consoleNotes, platformNotes]) {
    notes.sort((a, b) => (a.slug > b.slug ? -1 : 1));
  }
  return { apiSdkNotes, consoleNotes, platformNotes };
}, "release-notes");
