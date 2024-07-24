import "~/styles/article.css";

import { Link } from "@solidjs/meta";
import { useLocation, useParams } from "@solidjs/router";
import { createMemo, type JSXElement } from "solid-js";
import { MDXProvider } from "solid-mdx";

import * as prose from "~/components/prose";
import Gnb from "~/layouts/gnb/Gnb";
import SidebarProvider from "~/layouts/sidebar/context";
import SidebarBackground from "~/layouts/sidebar/SidebarBackground";
import { SystemVersionProvider } from "~/state/system-version";
import { Lang } from "~/type";

interface Props {
  children: JSXElement;
}

const navAsMenuPaths = ["/platform", "/blog", "/release-notes"];

export default function Layout(props: Props) {
  const location = useLocation();
  const params = useParams();
  const lang = createMemo(() => Lang.default("ko").parse(params.lang));

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
            />
            <SidebarBackground />
            <main class="min-h-0 flex-1">{props.children}</main>
          </div>
        </MDXProvider>
      </SidebarProvider>
    </SystemVersionProvider>
  );
}
