import type { APIRoute } from "astro";

import { generate } from "~/misc/opengraph/image-generator";

export const GET: APIRoute = async () => {
  const response = await generate({});
  return new Response(response, {
    status: 200,
    headers: {
      "Content-Type": "image/png",
    },
  });
};
