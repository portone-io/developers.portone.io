import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";
import "./styles/fonts.css";
import "@unocss/reset/tailwind.css";
import "uno.css";
import "./styles/global.css";
import "./styles/docsearch/_variables.css";
import "./styles/docsearch/modal.css";
import "./styles/docsearch/button.css";

import { withSentryRouterRouting } from "@sentry/solidstart/solidrouter";
import { Link, Meta, MetaProvider, Title } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";

import { NotFoundBoundary } from "./components/404";
import Trackers from "./layouts/trackers/Trackers";

const SentryRouter = withSentryRouterRouting(Router);

const ViteErrorHandler = () => {
  return (
    <script>
      {`
    window.addEventListener('vite:preloadError', (event) => {
      const key = 'vite-preload-error-reload';
      const lastReload = sessionStorage.getItem(key);
      const now = Date.now();
      if (!lastReload || now - Number(lastReload) > 1000) {
        sessionStorage.setItem(key, String(now));
        window.location.reload();
      }
    });
      `}
    </script>
  );
};

export default function App() {
  return (
    <SentryRouter
      root={(props) => (
        <MetaProvider>
          <Title>PortOne 개발자센터</Title>
          <Meta charset="utf-8" />
          <Meta name="viewport" content="width=device-width,initial-scale=1" />
          <Link rel="icon" type="image/png" href="/favicon.png" />
          <Trackers />
          <ViteErrorHandler />
          <Suspense>
            <NotFoundBoundary>{props.children}</NotFoundBoundary>
          </Suspense>
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </SentryRouter>
  );
}
