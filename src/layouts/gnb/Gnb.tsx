import { A } from "@solidjs/router";
import { clsx } from "clsx";
import { createMemo, For, untrack } from "solid-js";

import type { DocsEntry } from "~/content/config";
import { useSidebarContext } from "~/layouts/sidebar/context";
import { useSystemVersion } from "~/state/system-version";
import type { Lang, SystemVersion } from "~/type";

import Dropdown, { type DropdownItem } from "./Dropdown";
import Logo from "./Logo";
import MobileMenuButton from "./MobileMenuButton";
import { VersionSwitch } from "./VersionSwitch";

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

type Nav = {
  link?: string | Record<SystemVersion, string>;
  label: string;
  dropdownItems?: DropdownItem[];
};

export default function Gnb(props: Props) {
  const t = createMemo(() => (props.lang === "ko" ? ko : en));
  const { systemVersion } = useSystemVersion();
  const serverSystemVersion = untrack(systemVersion);
  const sidebarContext = useSidebarContext();

  const navs: Nav[] = [
    {
      link: "/opi/ko",
      label: "원 페이먼트 인프라",
      dropdownItems: [
        {
          label: "퀵 가이드",
        },
        {
          label: "연동하기",
        },
        {
          label: "부가기능",
        },
      ],
    },
    {
      link: "/platform",
      label: "파트너 정산 자동화",
      dropdownItems: [
        {
          label: "서비스 가이드",
        },
        {
          label: "사용 예시",
        },
      ],
    },
    {
      label: "API & SDK",
      link: { v1: "/api/rest-v1", v2: "/api/rest-v2" },
      dropdownItems: [
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
        {
          label: "브라우저 SDK",
          link: {
            v1: "/sdk/ko/v1-sdk/javascript-sdk/readme",
            v2: "/sdk/ko/v2-sdk/readme",
          },
        },
        {
          label: "모바일 SDK",
          link: {
            v1: "/sdk/ko/v1-mobile-sdk/readme",
            v2: "/sdk/ko/v2-mobile-sdk/readme",
          },
        },
        {
          label: "서버 SDK",
          link: "/sdk/ko/v2-server-sdk/readme",
          systemVersion: "v2",
        },
        {
          label: t()["sdk-playground"],
          link: "https://sdk-playground.portone.io/",
        },
      ],
    },
    {
      label: "리소스",
      dropdownItems: [
        {
          label: "릴리즈 노트",
          link: "/release-notes",
        },
        {
          label: "기술 블로그",
          link: "/blog",
        },
      ],
    },
  ];

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
        <div class="fixed h-inherit w-full">
          <header
            data-selected-system-version={systemVersion()}
            class="mx-auto h-inherit max-w-350 w-full flex items-center justify-between border-b bg-white z-gnb"
          >
            <div class="h-full flex flex-grow items-center pl-[env(safe-area-inset-left)]">
              <div class="h-full flex flex-grow items-center bg-white z-gnb-body md:flex-grow-0">
                <A
                  class="h-full inline-flex items-center"
                  href={`/opi/${props.lang}`}
                >
                  <div class="flex items-center gap-2">
                    <Logo class="w-22" />
                    <span class="break-keep">{t()["developers"]}</span>
                  </div>
                </A>
                <div class="mx-6 md:ml-[70px]"></div>
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
                <For each={navs}>
                  {(nav) => {
                    return (
                      <Dropdown
                        serverSystemVersion={serverSystemVersion}
                        items={nav.dropdownItems}
                        link={nav.link}
                      >
                        <span>{nav.label}</span>
                      </Dropdown>
                    );
                  }}
                </For>
              </div>
            </div>
            <div class="hidden h-full items-center gap-4 pr-[env(safe-area-inset-right)] md:flex">
              <VersionSwitch docData={props.docData} />
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
      </div>
    </>
  );
}
