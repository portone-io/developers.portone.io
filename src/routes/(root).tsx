import "~/styles/article.css";

import { useLocation } from "@solidjs/router";
import type { WebSite, WithContext } from "schema-dts";
import { createMemo, type JSXElement } from "solid-js";

import JsonLd from "~/components/JsonLd";
import Gnb from "~/layouts/gnb/Gnb";
import SidebarProvider from "~/layouts/sidebar/context";
import SidebarBackground from "~/layouts/sidebar/SidebarBackground";
import { SystemVersionProvider } from "~/state/system-version";

const websiteJsonLd: WithContext<WebSite> = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "PortOne Developers",
  url: "https://developers.portone.io",
  publisher: {
    "@type": "Organization",
    name: "PortOne",
    url: "https://portone.io",
    logo: {
      "@type": "ImageObject",
      url: "https://developers.portone.io/opengraph.png",
    },
  },
};

interface Props {
  children: JSXElement;
}

const navAsMenuPaths = ["/blog", "/release-notes"];

export default function Layout(props: Props) {
  const location = useLocation();
  const lang = createMemo<"ko">(() => "ko");

  return (
    <SystemVersionProvider>
      <SidebarProvider>
        <div class="h-full flex flex-col">
          <Gnb
            lang={lang()}
            navAsMenu={navAsMenuPaths.some((path) =>
              location.pathname.startsWith(path),
            )}
          />
          <SidebarBackground />
          <JsonLd data={websiteJsonLd} />
          <main class="mx-auto max-w-8xl min-h-0 w-full flex-1 lg:px-10 md:px-8 sm:px-6">
            {props.children}
          </main>
        </div>
      </SidebarProvider>
    </SystemVersionProvider>
  );
}
