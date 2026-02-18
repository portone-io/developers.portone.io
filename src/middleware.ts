import { sentryBeforeResponseMiddleware } from "@sentry/solidstart";
import { createMiddleware } from "@solidjs/start/middleware";
import { deleteCookie } from "vinxi/http";

export default createMiddleware({
  onRequest: (event) => {
    deleteCookie(event.nativeEvent, "__vdpl", {
      httpOnly: true,
      path: "/_build/assets",
      sameSite: "strict",
      secure: true,
    });
    deleteCookie(event.nativeEvent, "__vdpl", {
      httpOnly: true,
      path: "/_server",
      sameSite: "strict",
      secure: true,
    });
  },
  onBeforeResponse: [sentryBeforeResponseMiddleware()],
});
