import "~/styles/article.css";

import { type RouteDefinition, useLocation } from "@solidjs/router";
import type { WebSite, WithContext } from "schema-dts";
import { createMemo, type JSXElement } from "solid-js";

import JsonLd, { organizationJsonLd } from "~/components/JsonLd";
import { preloadDocs } from "~/layouts/docs";
import Gnb from "~/layouts/gnb/Gnb";
import SidebarProvider from "~/layouts/sidebar/context";
import SidebarBackground from "~/layouts/sidebar/SidebarBackground";
import { SystemVersionProvider } from "~/state/system-version";

const websiteJsonLd: WithContext<WebSite> = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "PortOne Developers",
  url: "https://developers.portone.io",
  publisher: organizationJsonLd,
};

interface Props {
  children: JSXElement;
}

const navAsMenuPaths = ["/blog", "/release-notes"];

export const route = {
  preload: ({ location }) => {
    void preloadDocs(location.pathname);
  },
} satisfies RouteDefinition;

export default function Layout(props: Props) {
  const location = useLocation();
  const lang = createMemo<"ko">(() => "ko");

  return (
    <SystemVersionProvider>
      <SidebarProvider>
        <div class="flex h-full flex-col">
          <Gnb
            lang={lang()}
            navAsMenu={navAsMenuPaths.some((path) =>
              location.pathname.startsWith(path),
            )}
          />
          <SidebarBackground />
          <JsonLd data={websiteJsonLd} />
          <main class="max-w-8xl mx-auto min-h-0 w-full flex-1 sm:px-6 md:px-8 lg:px-10">
            {props.children}
          </main>
        </div>
      </SidebarProvider>
    </SystemVersionProvider>
  );
}
