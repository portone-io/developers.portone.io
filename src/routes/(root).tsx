import "~/styles/article.css";

import {
  createAsync,
  type RouteDefinition,
  useLocation,
} from "@solidjs/router";
import { createMemo, type JSXElement } from "solid-js";
import { MDXProvider } from "solid-mdx";

import { prose } from "~/components/prose";
import Gnb from "~/layouts/gnb/Gnb";
import SidebarProvider from "~/layouts/sidebar/context";
import SidebarBackground from "~/layouts/sidebar/SidebarBackground";
import { parseDocsFullSlug } from "~/misc/docs";
import { getInteractiveDocs } from "~/misc/interactiveDocs";
import { InteractiveDocsProvider } from "~/state/interactive-docs";
import { SystemVersionProvider } from "~/state/system-version";

interface Props {
  children: JSXElement;
}

const navAsMenuPaths = ["/blog", "/release-notes"];

const loadInteractiveDocs = async (pathname: string) => {
  const parsedFullSlug = parseDocsFullSlug(pathname);
  if (!parsedFullSlug) return;
  const [contentName, fullSlug] = parsedFullSlug;
  return getInteractiveDocs(contentName, fullSlug);
};

export const route = {
  preload: ({ location }) => {
    void loadInteractiveDocs(location.pathname);
  },
} satisfies RouteDefinition;

export default function Layout(props: Props) {
  const location = useLocation();
  const interactiveDocs = createAsync(
    () => loadInteractiveDocs(location.pathname),
    {
      deferStream: true,
    },
  );
  const lang = createMemo<"ko">(() => "ko");

  return (
    <SystemVersionProvider>
      <SidebarProvider>
        <InteractiveDocsProvider initial={interactiveDocs()}>
          <MDXProvider components={prose}>
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
          </MDXProvider>
        </InteractiveDocsProvider>
      </SidebarProvider>
    </SystemVersionProvider>
  );
}
