import type { APIRoute } from "astro";
import { getEntryBySlug } from "astro:content";

import authors from "~/content/blog/_authors.yaml";
import { generate } from "~/misc/opengraph/image-generator";

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  const { slug } = params;
  const entry = await getEntryBySlug("blog", slug!);
  if (!entry) return new Response(null, { status: 404 });

  const generateConfig = {
    name: authors[entry.data.author]!.name,
    role: authors[entry.data.author]!.role,
    profileImage: `https://github.com/${entry.data.author}.png`,
    title: entry.data.title,
    description: entry.data.description,
  };
  const response = await generate(generateConfig);

  return new Response(response, {
    status: 200,
    headers: {
      "Content-Type": "image/png",
    },
  });
};
