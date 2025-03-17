// @refresh reload
import "#thumbnail";

import * as Sentry from "@sentry/solidstart";
import { mount, StartClient } from "@solidjs/start/client";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: import.meta.env.VITE_VERCEL_ENV ?? import.meta.env.MODE,
  release: import.meta.env.VITE_VERCEL_GIT_COMMIT_SHA,
});

mount(() => <StartClient />, document.getElementById("app")!);
