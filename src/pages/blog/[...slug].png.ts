import type { APIRoute } from "astro";
import { getEntryBySlug } from "astro:content";
import { generate } from "~/misc/opengraph/image-generator";
import names from "~/content/blog/_names.yaml";

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  const { slug } = params;
  const entry = await getEntryBySlug("blog", slug!);
  const generateConfig = entry
    ? {
        name: names[entry.data.author]!,
        profileImage: `https://github.com/${entry.data.author}.png`,
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
