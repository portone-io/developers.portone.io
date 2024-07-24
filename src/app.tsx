import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";
import "@unocss/reset/tailwind.css";
import "uno.css";
import "./styles/global.css";

import { Link, Meta, MetaProvider, Title } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";

import { NotFoundBoundary } from "./components/404";
import Trackers from "./layouts/trackers/Trackers";

export default function App() {
  return (
    <Router
      root={(props) => (
        <MetaProvider>
          <Title>PortOne 개발자센터</Title>
          <Meta charset="utf-8" />
          <Meta name="viewport" content="width=device-width,initial-scale=1" />
          <Link rel="icon" type="image/png" href="/favicon.png" />
          <Trackers />
          <Suspense>
            <NotFoundBoundary>{props.children}</NotFoundBoundary>
          </Suspense>
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
