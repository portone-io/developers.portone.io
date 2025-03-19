import * as Sentry from "@sentry/solidstart";

Sentry.init({
  dsn: process.env?.VITE_SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env?.VERCEL_ENV ?? "development",
  release: process.env?.VERCEL_GIT_COMMIT_SHA,
});
