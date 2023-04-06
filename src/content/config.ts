import { defineCollection, z } from "astro:content";

const docCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string(),
  }),
});

export const collections = {
  "docs": docCollection,
};
