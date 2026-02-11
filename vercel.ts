import { routes, type VercelConfig } from "@vercel/config/v1";

export default {
  headers: [
    routes.header("/(.*)", [
      { key: "X-Content-Type-Options", value: "nosniff" },
    ]),
  ],
} satisfies VercelConfig;
