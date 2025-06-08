// @refresh reload
import "#thumbnail";

import * as Sentry from "@sentry/solidstart";
import { solidRouterBrowserTracingIntegration } from "@sentry/solidstart/solidrouter";
import { mount, StartClient } from "@solidjs/start/client";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN as string,
  tracesSampleRate: 1.0,
  environment: (import.meta.env.VITE_VERCEL_ENV ??
    import.meta.env.MODE) as string,
  release: import.meta.env.VITE_VERCEL_GIT_COMMIT_SHA as string,
  integrations: [solidRouterBrowserTracingIntegration()],
});

mount(() => <StartClient />, document.getElementById("app")!);
