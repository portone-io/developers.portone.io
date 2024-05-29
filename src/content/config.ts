import { defineCollection, z } from "astro:content";

import { SystemVersion } from "~/type";

const docCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string(),
    targetVersions: z.array(SystemVersion).optional(),
    versionVariants: z.record(SystemVersion, z.string()).optional(),
  }),
});

const blogCollection = defineCollection({
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      date: z.date(),
      author: z.string(),
      tags: z.array(z.string()),
      thumbnail: z.union([image(), z.string().url()]),
      draft: z.boolean().optional(),
    }),
});

const releaseNoteCollection = defineCollection({
  schema: z.object({
    releasedAt: z.date(),
    writtenAt: z.date(),
  }),
});

const apiSectionDescriptionCollection = defineCollection({
  schema: z.object({}),
});

const platformCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    no: z.number(),
  }),
});

export const collections = {
  docs: docCollection,
  blog: blogCollection,
  "release-notes": releaseNoteCollection,
  "api-section-description": apiSectionDescriptionCollection,
  platform: platformCollection,
};
