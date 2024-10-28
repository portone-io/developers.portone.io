import { cache, createAsync, useLocation } from "@solidjs/router";
import { createMemo, For, Show } from "solid-js";

import { useSystemVersion } from "~/state/system-version";
import type { Lang } from "~/type";

import DropdownLink from "./DropdownLink";
import LeftSidebar from "./LeftSidebar";
import LeftSidebarItem from "./LeftSidebarItem";
import { SearchButton } from "./search";

interface Props {
  nav: string;
  lang: Lang;
  slug: string;
}

const getNavMenuItems = cache(async (nav: string, lang: Lang) => {
  "use server";

  const { navMenu } = await import("~/state/server-only/nav");
  return navMenu[nav as keyof typeof navMenu][lang] || [];
}, "nav/menu-items");

export default function DocsNavMenu(props: Props) {
  const { systemVersion } = useSystemVersion();
  const location = useLocation();
  const memoizedLang = createMemo(() => props.lang);
  const navMenuItems = createAsync(() =>
    getNavMenuItems(props.nav, memoizedLang()),
  );

  return (
    <LeftSidebar>
      <div class="px-4 pt-28px">
        <div class="md:hidden">
          <DropdownLink
            pathname={location.pathname}
            items={[
              { label: "원 페이먼트 인프라", link: "/opi/ko" },
              { label: "REST API", link: "/api/rest-v2" },
              { label: "포트원 SDK", link: "/sdk/ko" },
              { label: "파트너 정산 자동화", link: "/platform" },
              { label: "릴리스 노트", link: "/release-notes" },
              { label: "기술 블로그", link: "/blog" },
            ]}
          />
          <div class="my-4 h-1px bg-neutral-200"></div>
        </div>
      </div>
      <div class="relative flex flex-col gap-2 px-2 pb-4">
        <SearchButton lang={props.lang} />
      </div>
      <nav id="nav-menu" class="relative flex-1 overflow-y-scroll">
        <ul class="flex flex-col gap-1 px-2 pb-4">
          <For each={navMenuItems()}>
            {(item) => {
              if (item.type === "group") {
                return (
                  <Show
                    when={
                      !item.systemVersion ||
                      systemVersion() === item.systemVersion
                    }
                  >
                    <li class="[&:not(:last-child)]:mb-4">
                      <h4 class="p-2 text-lg font-bold first:mt-0">
                        <span>{item.label}</span>
                      </h4>
                      <ul class="flex flex-col gap-1">
                        <For each={item.items}>
                          {(item) => (
                            <Show
                              when={
                                !item.systemVersion ||
                                systemVersion() === item.systemVersion
                              }
                            >
                              <li>
                                <LeftSidebarItem {...item} />
                              </li>
                            </Show>
                          )}
                        </For>
                      </ul>
                    </li>
                  </Show>
                );
              }
              if (item.path === "===") {
                return (
                  <li>
                    <hr class="mx-2 my-4" />
                  </li>
                );
              }
              return (
                <Show
                  when={
                    !item.systemVersion ||
                    systemVersion() === item.systemVersion
                  }
                >
                  <li>
                    <LeftSidebarItem {...item} />
                  </li>
                </Show>
              );
            }}
          </For>
        </ul>
      </nav>
    </LeftSidebar>
  );
}
