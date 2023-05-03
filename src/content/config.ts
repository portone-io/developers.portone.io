import { defineCollection, z } from "astro:content";

const docCollection = defineCollection({
  schema: z.object({
    emoji: z.string().optional(),
    title: z.string(),
    description: z.string(),
  }),
});

const blogCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.date().optional(),
    draft: z.boolean().optional(),
  }),
});

export const collections = {
  docs: docCollection,
  blog: blogCollection,
};
