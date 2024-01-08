import { defineCollection, z } from "astro:content";

const docCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string(),
  }),
});

const blogCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.date(),
    author: z.string(),
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

export const collections = {
  docs: docCollection,
  blog: blogCollection,
  "release-notes": releaseNoteCollection,
  "api-section-description": apiSectionDescriptionCollection,
};
