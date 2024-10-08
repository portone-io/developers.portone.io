import "~/styles/article.css";

import { Link } from "@solidjs/meta";
import {
  cache,
  createAsync,
  type RouteDefinition,
  useLocation,
} from "@solidjs/router";
import { createMemo, createResource, type JSXElement, Show } from "solid-js";
import { MDXProvider } from "solid-mdx";

import * as prose from "~/components/prose";
import type { DocsEntry } from "~/content/config";
import Gnb from "~/layouts/gnb/Gnb";
import SidebarProvider from "~/layouts/sidebar/context";
import { SearchProvider, SearchScreen } from "~/layouts/sidebar/search";
import SidebarBackground from "~/layouts/sidebar/SidebarBackground";
import { getOpiFullSlug, loadDoc } from "~/misc/opi";
import { calcNavMenuSystemVersions } from "~/state/nav";
import { SystemVersionProvider } from "~/state/system-version";
import type { Lang } from "~/type";

interface Props {
  children: JSXElement;
}

const navAsMenuPaths = ["/platform", "/blog", "/release-notes"];

export const route = {
  preload: ({ location }) => {
    const lang = location.pathname.includes("/en/") ? "en" : "ko";
    void loadNavMenuSystemVersions(lang);

    const fullSlug = getOpiFullSlug(location.pathname);
    if (!fullSlug) return;

    void loadDoc(fullSlug);
  },
} satisfies RouteDefinition;

const loadNavMenuSystemVersions = cache(async (lang: Lang) => {
  "use server";

  const { navMenu } = await import("~/state/server-only/nav");
  return calcNavMenuSystemVersions(navMenu[lang] || []);
}, "nav-menu-system-versions");

export default function Layout(props: Props) {
  const location = useLocation();
  const lang = createMemo(() =>
    location.pathname.includes("/en/") ? "en" : "ko",
  );
  const docsSlug = createMemo(() => getOpiFullSlug(location.pathname));
  const docData = createAsync(async () => {
    const slug = docsSlug();
    if (!slug) return;
    try {
      return await loadDoc(slug);
    } catch (e) {
      if (e instanceof Error && e.name === "NotFoundError") {
        return;
      }
      throw e;
    }
  });
  const [navMenuSystemVersions] = createResource(() =>
    loadNavMenuSystemVersions(lang()),
  );

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
                docData={docData()?.frontmatter as DocsEntry}
              />
              <SidebarBackground />
              <main class="mx-auto max-w-8xl min-h-0 w-full flex-1 px-10">
                {props.children}
              </main>
            </div>
            <Show when={navMenuSystemVersions.latest}>
              {(versions) => (
                <SearchScreen
                  lang={lang()}
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
