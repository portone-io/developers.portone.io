import "~/styles/article.css";

import { Link } from "@solidjs/meta";
import { createAsync, useLocation } from "@solidjs/router";
import { createMemo, type JSXElement } from "solid-js";
import { MDXProvider } from "solid-mdx";

import * as prose from "~/components/prose";
import type { DocsEntry } from "~/content/config";
import Gnb from "~/layouts/gnb/Gnb";
import SidebarProvider from "~/layouts/sidebar/context";
import SidebarBackground from "~/layouts/sidebar/SidebarBackground";
import { loadDoc, parseDocsFullSlug } from "~/misc/docs";
import { SystemVersionProvider } from "~/state/system-version";

interface Props {
  children: JSXElement;
}

const navAsMenuPaths = ["/platform", "/blog", "/release-notes"];

export default function Layout(props: Props) {
  const location = useLocation();
  const lang = createMemo(() =>
    location.pathname.includes("/en/") ? "en" : "ko",
  );
  const docsSlug = createMemo(() => parseDocsFullSlug(location.pathname));
  const docData = createAsync(async () => {
    const parsedSlug = docsSlug();
    if (!parsedSlug) return;
    const [contentName, slug] = parsedSlug;
    try {
      return await loadDoc(contentName, slug);
    } catch (e) {
      if (e instanceof Error && e.name === "NotFoundError") {
        return;
      }
      throw e;
    }
  });

  return (
    <SystemVersionProvider>
      <Link
        rel="canonical"
        href={`https://developers.portone.io${location.pathname}`}
      />
      <SidebarProvider>
        <MDXProvider components={prose}>
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
        </MDXProvider>
      </SidebarProvider>
    </SystemVersionProvider>
  );
}
