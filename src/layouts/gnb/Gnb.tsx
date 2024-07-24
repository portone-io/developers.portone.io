import { A, useLocation } from "@solidjs/router";
import { clsx } from "clsx";
import { createMemo, Show, untrack } from "solid-js";

import type { DocsEntry } from "~/content/config";
import { useSidebarContext } from "~/layouts/sidebar/context";
import { useSystemVersion } from "~/state/system-version";
import type { Lang } from "~/type";

import Dropdown from "./Dropdown";
import Logo from "./Logo";
import styles from "./mobile-nav.module.css";
import MobileMenuButton from "./MobileMenuButton";
import VersionSwitch from "./VersionSwitch";

interface Props {
  lang: Lang;
  navAsMenu: boolean;
  docData?: DocsEntry;
}

const ko = {
  developers: "개발자센터",
  "sdk-playground": "SDK 놀이터",
  console: "관리자 콘솔",
  language: "언어",
};
const en: typeof ko = {
  developers: "Developers",
  "sdk-playground": "SDK Playground",
  console: "Admin Console",
  language: "Language",
};

export default function Gnb(props: Props) {
  const location = useLocation();
  const t = createMemo(() => (props.lang === "ko" ? ko : en));
  const { systemVersion } = useSystemVersion();
  const serverSystemVersion = untrack(systemVersion);
  const sidebarContext = useSidebarContext();

  return (
    <>
      <style>
        {`
        [data-selected-system-version="v1"] [data-system-version="v2"],
        [data-selected-system-version="v2"] [data-system-version="v1"] {
          display: none;
        }
        `}
      </style>
      <div class="h-14">
        <header
          data-selected-system-version={systemVersion()}
          class="fixed h-inherit w-full flex items-center justify-between border-b bg-white z-gnb"
        >
          <div class="h-full flex flex-grow items-center pl-4 md:pl-6">
            <div class="h-full flex flex-grow items-center bg-white z-gnb-body md:flex-grow-0">
              <A
                class="h-full inline-flex items-center"
                href={`/docs/${props.lang}`}
              >
                <div class="flex items-center gap-2">
                  <Logo class="w-22" />
                  <span class="break-keep">{t()["developers"]}</span>
                </div>
              </A>
              <div class="mx-6 md:ml-[70px]">
                <VersionSwitch docData={props.docData} />
              </div>
            </div>
            <div
              class={clsx(
                "flex gap-6 md:h-full items-center",
                props.navAsMenu
                  ? "<md:(absolute inset-x-0 bottom-0 px-12 py-6 rounded-b-md transition-transform transform duration-300 flex-col items-start bg-white)"
                  : "<md:hidden",
                props.navAsMenu &&
                  sidebarContext.get() &&
                  "<md:(translate-y-full shadow-lg)",
              )}
            >
              <Dropdown
                serverSystemVersion={serverSystemVersion}
                link={{ v1: "/api/rest-v1", v2: "/api/rest-v2" }}
                items={[
                  {
                    label: "REST API V1",
                    link: "/api/rest-v1",
                    systemVersion: "v1",
                  },
                  {
                    label: "REST API V2",
                    link: "/api/rest-v2",
                    systemVersion: "v2",
                  },
                  // { label: "GraphQL API", link: "/api/graphql" },
                  {
                    label: t()["sdk-playground"],
                    link: "https://sdk-playground.portone.io/",
                  },
                ]}
              >
                <span
                  class={clsx(
                    location.pathname.startsWith("/api") && "nav-active",
                  )}
                >
                  API & SDK
                </span>
              </Dropdown>
              <Show when={props.lang === "ko"}>
                <A class="h-full inline-flex items-center" href="/platform">
                  <span
                    class={clsx(
                      location.pathname.startsWith("/platform") &&
                        styles.navActive,
                    )}
                  >
                    파트너 정산
                  </span>
                </A>
                <A
                  class="h-full inline-flex items-center"
                  href="/release-notes"
                >
                  <span
                    class={clsx(
                      location.pathname.startsWith("/release-notes") &&
                        styles.navActive,
                    )}
                  >
                    릴리즈 노트
                  </span>
                </A>
                <A class="h-full inline-flex items-center" href="/blog">
                  <span
                    class={clsx(
                      location.pathname.startsWith("/blog") && styles.navActive,
                    )}
                  >
                    기술 블로그
                  </span>
                </A>
              </Show>
            </div>
          </div>
          <div class="hidden h-full items-center gap-4 pr-6 md:flex">
            <a
              class="inline-flex items-center gap-1"
              href="https://admin.portone.io/"
            >
              <span>{t()["console"]}</span>
              <i class="i-ic-baseline-launch"></i>
            </a>
            {/* <a href={`/docs/${lang === "ko" ? "en" : "ko"}`}>
              {lang === "ko" ? "🇺🇸 English" : "🇰🇷 한국어"}
            </a> */}
          </div>
          <MobileMenuButton />
        </header>
      </div>
    </>
  );
}
