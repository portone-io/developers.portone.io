import type { APIEvent } from "@solidjs/start/server";

import { blog } from "#content";
import { generate } from "~/misc/opengraph/image-generator";

import authors from "./_authors.yaml";

export const GET = async ({ params }: APIEvent) => {
  const { slugDotPng } = params;
  if (!slugDotPng?.endsWith(".png")) return;
  const slug = slugDotPng.slice(0, -4);
  const entry = blog[slug as keyof typeof blog];
  if (!entry) return;

  const generateConfig = {
    name: authors[entry.frontmatter.author]!.name,
    role: authors[entry.frontmatter.author]!.role,
    profileImage: `https://github.com/${entry.frontmatter.author}.png`,
    title: entry.frontmatter.title,
    description: entry.frontmatter.description,
  };
  const response = await generate(generateConfig);

  return new Response(response, {
    status: 200,
    headers: { "Content-Type": "image/png" },
  });
};
