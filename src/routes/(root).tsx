import "~/styles/article.css";

import { Link } from "@solidjs/meta";
import { cache, type RouteDefinition, useLocation } from "@solidjs/router";
import { createMemo, createResource, type JSXElement, Show } from "solid-js";
import { MDXProvider } from "solid-mdx";

import * as prose from "~/components/prose";
import Gnb from "~/layouts/gnb/Gnb";
import SidebarProvider from "~/layouts/sidebar/context";
import { SearchProvider, SearchScreen } from "~/layouts/sidebar/search";
import SidebarBackground from "~/layouts/sidebar/SidebarBackground";
import { loadDoc, parseDocsFullSlug } from "~/misc/docs";
import { calcNavMenuSystemVersions } from "~/state/nav";
import { SystemVersionProvider } from "~/state/system-version";
import type { Lang } from "~/type";

interface Props {
  children: JSXElement;
}

const navAsMenuPaths = ["/blog", "/release-notes"];

export const route = {
  preload: ({ location }) => {
    const parsedFullSlug = parseDocsFullSlug(location.pathname);
    if (!parsedFullSlug) return;
    const [contentName, fullSlug] = parsedFullSlug;

    const lang = location.pathname.includes("/en/") ? "en" : "ko";

    void loadNavMenuSystemVersions(lang);
    void loadDoc(contentName, fullSlug);
  },
} satisfies RouteDefinition;

const loadNavMenuSystemVersions = cache(async (lang: Lang) => {
  "use server";

  const { navMenu } = await import("~/state/server-only/nav");
  return calcNavMenuSystemVersions(Object.values(navMenu[lang]).flat());
}, "nav-menu-system-versions");

export default function Layout(props: Props) {
  const location = useLocation();
  const lang = createMemo(() =>
    location.pathname.includes("/en/") ? "en" : "ko",
  );
  const searchIndex = createMemo(() => {
    if (location.pathname.startsWith("/blog")) {
      return "blog";
    }
    return lang();
  });
  const [navMenuSystemVersions] = createResource(() => {
    return loadNavMenuSystemVersions(lang());
  });

  return (
    <SystemVersionProvider>
      <Link
        rel="canonical"
        href={`https://developers.portone.io${location.pathname}`}
      />
      <SidebarProvider>
        <MDXProvider components={prose}>
          <SearchProvider>
            <div class="h-full flex flex-col">
              <Gnb
                lang={lang()}
                navAsMenu={navAsMenuPaths.some((path) =>
                  location.pathname.startsWith(path),
                )}
              />
              <SidebarBackground />
              <main class="mx-auto max-w-8xl min-h-0 w-full flex-1 lg:px-10 md:px-8 sm:px-6">
                {props.children}
              </main>
            </div>
            <Show when={navMenuSystemVersions.latest}>
              {(versions) => (
                <SearchScreen
                  searchIndex={searchIndex()}
                  navMenuSystemVersions={versions()}
                />
              )}
            </Show>
          </SearchProvider>
        </MDXProvider>
      </SidebarProvider>
    </SystemVersionProvider>
  );
}
