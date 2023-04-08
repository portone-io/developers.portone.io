import { defineCollection, z } from "astro:content";

const docCollection = defineCollection({
  schema: z.object({
    emoji: z.string().optional(),
    title: z.string(),
    description: z.string(),
  }),
});

export const collections = {
  "docs": docCollection,
};
