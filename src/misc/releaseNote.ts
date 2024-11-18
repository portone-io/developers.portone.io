import { cache } from "@solidjs/router";
import { format } from "date-fns";
import { match } from "ts-pattern";

import type { ReleaseNoteEntry } from "~/content/config";

export interface ReleaseNote {
  slug: string;
  entry: ReleaseNoteEntry;
}

const getReleaseNoteLabel = (slug: string) =>
  match(slug)
    .when(
      (v) => v.startsWith("api-sdk"),
      () => "원 페이먼트 인프라",
    )
    .when(
      (v) => v.startsWith("console"),
      () => "관리자콘솔",
    )
    .when(
      (v) => v.startsWith("platform"),
      () => "파트너 정산 자동화",
    )
    .run();

export const getReleaseNoteTitle = (releasedAt: Date, slug: string) =>
  `${format(releasedAt, "yyyy-MM-dd")} ${getReleaseNoteLabel(slug)} 업데이트`;

export const getReleaseNoteDescription = (releasedAt: Date, slug: string) =>
  `${format(releasedAt, "yyyy-MM-dd")} ${getReleaseNoteLabel(slug)} 업데이트 소식을 안내드립니다.`;

export const makeReleaseNoteFrontmatter = (
  releaseAt: Date,
  fullSlug: string,
) => {
  const slug = fullSlug.replace(/release-notes\/\(note\)\//, "");
  return {
    title: getReleaseNoteTitle(releaseAt, slug),
    description: getReleaseNoteDescription(releaseAt, slug),
  };
};

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
