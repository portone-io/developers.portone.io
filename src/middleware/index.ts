import { createMiddleware } from "@solidjs/start/middleware";

export default createMiddleware({
  onRequest: (event) => {
    console.log(`Processing request for: ${event.request.url}`);

    const url = new URL(event.request.url);
    const pathname = url.pathname;

    // Only process paths that end with .md
    if (pathname.endsWith(".md") && !pathname.startsWith("/markdown/")) {
      console.log(`Redirecting ${pathname} to /markdown${pathname}`);
      return new Response(null, {
        status: 302,
        headers: {
          Location: `/markdown${pathname}`,
        },
      });
    }
  },
});
