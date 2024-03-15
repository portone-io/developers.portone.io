import type { APIRoute } from "astro";
import { getEntryBySlug } from "astro:content";

import { generate } from "~/misc/opengraph/image-generator";

export const GET: APIRoute = async ({ params }) => {
  const { lang, slug } = params;
  const entry = await getEntryBySlug("docs", `${lang}/${slug}`);
  const generateConfig = entry
    ? {
        title: entry.data.title,
        description: entry.data.description,
      }
    : {};
  const response = await generate(generateConfig);
  return new Response(response, {
    status: 200,
    headers: {
      "Content-Type": "image/png",
    },
  });
};
