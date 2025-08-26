import "~/styles/article.css";

import { useLocation } from "@solidjs/router";
import { createMemo, type JSXElement } from "solid-js";

import Gnb from "~/layouts/gnb/Gnb";
import SidebarProvider from "~/layouts/sidebar/context";
import SidebarBackground from "~/layouts/sidebar/SidebarBackground";
import { SystemVersionProvider } from "~/state/system-version";

interface Props {
  children: JSXElement;
}

const navAsMenuPaths = ["/blog", "/release-notes"];

const ViteErrorHandler = () => {
  return (
    <script>
      {`
    window.addEventListener('vite:preloadError', (event) => {
      window.location.reload();
    });
    `}
    </script>
  );
};

export default function Layout(props: Props) {
  const location = useLocation();
  const lang = createMemo<"ko">(() => "ko");

  return (
    <>
      <ViteErrorHandler />
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
            <main class="mx-auto max-w-8xl min-h-0 w-full flex-1 lg:px-10 md:px-8 sm:px-6">
              {props.children}
            </main>
          </div>
        </SidebarProvider>
      </SystemVersionProvider>
    </>
  );
}
