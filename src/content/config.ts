import { z } from "zod";

import { SystemVersion } from "~/type";

const DocsEntry = z.object({
  title: z.string(),
  description: z.string(),
  targetVersions: z.array(SystemVersion).optional(),
  versionVariants: z.record(SystemVersion, z.string()).optional(),
});
export type DocsEntry = z.infer<typeof DocsEntry>;

const image = () => z.string().url();

const BlogEntry = z.object({
  title: z.string(),
  description: z.string(),
  date: z.date(),
  author: z.string(),
  tags: z.array(z.string()),
  thumbnail: z.union([image(), z.string().url()]),
  draft: z.boolean().optional(),
});
export type BlogEntry = z.infer<typeof BlogEntry>;

const ReleaseNoteEntry = z.object({
  releasedAt: z.date(),
  writtenAt: z.date(),
});
export type ReleaseNoteEntry = z.infer<typeof ReleaseNoteEntry>;

const ApiSectionDescriptionEntry = z.object({});
export type ApiSectionDescriptionEntry = z.infer<
  typeof ApiSectionDescriptionEntry
>;

const PlatformEntry = z.object({
  title: z.string(),
  no: z.number(),
});
export type PlatformEntry = z.infer<typeof PlatformEntry>;

export const config = {
  docs: {
    path: "docs",
    entrySchema: DocsEntry,
  },
  releaseNotes: {
    path: "release-notes",
    entrySchema: ReleaseNoteEntry,
  },
} satisfies Record<string, CollectionConfig>;

export type CollectionConfig = {
  path: string;
  entrySchema: z.ZodType<unknown>;
};
