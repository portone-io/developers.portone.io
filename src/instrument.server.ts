import * as Sentry from "@sentry/solidstart";
import { definePlugin } from "nitro";

import { sentryDataCollection } from "~/misc/sentry";

export default definePlugin(() => {
  Sentry.init({
    dsn: process.env?.VITE_SENTRY_DSN,
    tracesSampleRate: 0.1,
    environment: process.env?.VERCEL_ENV ?? "development",
    release: process.env?.VERCEL_GIT_COMMIT_SHA,
    dataCollection: sentryDataCollection,
  });
});
