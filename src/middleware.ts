import { sentryBeforeResponseMiddleware } from "@sentry/solidstart";
import { createMiddleware } from "@solidjs/start/middleware";
import { setCookie } from "vinxi/http";

export default createMiddleware({
  onRequest: (event) => {
    if (
      process.env.VERCEL_SKEW_PROTECTION_ENABLED === "1" &&
      process.env.VERCEL_DEPLOYMENT_ID
    ) {
      setCookie(event.nativeEvent, "__vdpl", process.env.VERCEL_DEPLOYMENT_ID, {
        httpOnly: true,
        path: "/",
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
      });
    }
  },
  onBeforeResponse: [sentryBeforeResponseMiddleware()],
});
