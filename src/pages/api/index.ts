import type { APIRoute } from "astro";

import { useSystemVersion } from "#state/system-version";

export const GET: APIRoute = () => {
  const systemVersion = useSystemVersion();
  const redirectTo = {
    v1: "/api/rest-v1",
    v2: "/api/rest-v2",
  }[systemVersion];

  return new Response(null, {
    status: 301,
    headers: { Location: redirectTo },
  });
};
