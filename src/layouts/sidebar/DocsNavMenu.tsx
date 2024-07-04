import { cache, createAsync, useLocation } from "@solidjs/router";
import {
  createContext,
  createEffect,
  createMemo,
  createRenderEffect,
  createSignal,
  For,
  onMount,
  Show,
  useContext,
} from "solid-js";

import { calcNavMenuAncestors } from "~/state/nav";
import { useSystemVersion } from "~/state/system-version";
import type { Lang } from "~/type";

import DropdownLink from "./DropdownLink";
import LeftSidebar from "./LeftSidebar";
import LeftSidebarItem from "./LeftSidebarItem";
import { SearchButton } from "./search";

interface Props {
  lang: Lang;
  slug: string;
}

const getNavMenuItems = cache(async (lang: Lang) => {
  "use server";

  const { navMenu } = await import("~/state/server-only/nav");
  return navMenu[lang] || [];
}, "nav/menu-items");

const navOpenStates = createContext({
  openNavs: (): Set<string> => new Set(),
  toggleNav: (_: string) => {},
});

export const useNavOpenStates = () => useContext(navOpenStates);

export default function DocsNavMenu(props: Props) {
  const { systemVersion } = useSystemVersion();
  const location = useLocation();
  const navMenuItems = createAsync(() => getNavMenuItems(props.lang));
  const navMenuAncestors = createMemo(() => {
    const items = navMenuItems();
    if (!items) return null;
    return calcNavMenuAncestors(items);
  });
  const [openNavs, setOpenNavs] = createSignal<Set<string>>(new Set());

  createRenderEffect(() => {
    const ancestors = navMenuAncestors();
    if (!ancestors) return;
    const slug = `/${props.lang}/${props.slug}`;
    setOpenNavs(new Set([...(ancestors[slug] ?? []), slug]));
  });

  onMount(() => {
    const prevOpenNavs = JSON.parse(
      globalThis.sessionStorage?.getItem("openNavs") || "[]",
    ) as string[];
    setOpenNavs((openNavs) => new Set([...prevOpenNavs, ...openNavs]));
  });

  createEffect(() => {
    const openNavsStr = JSON.stringify([...openNavs()]);
    globalThis.sessionStorage.setItem("openNavs", openNavsStr);
  });

  const toggleNav = (slug: string) => {
    setOpenNavs((openNavs) => {
      const newOpenNavs = new Set(openNavs);
      if (newOpenNavs.has(slug)) newOpenNavs.delete(slug);
      else newOpenNavs.add(slug);
      return newOpenNavs;
    });
  };

  return (
    <navOpenStates.Provider value={{ openNavs, toggleNav }}>
      <LeftSidebar>
        <div class="px-4 pt-28px">
          <div class="md:hidden">
            <DropdownLink
              pathname={location.pathname}
              items={[
                { label: "개발자센터", link: "/docs" },
                { label: "API & SDK", link: "/api/rest-v2" },
                { label: "파트너 정산", link: "/platform" },
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
                                  <LeftSidebarItem
                                    {...item}
                                    pageSlug={props.slug}
                                  />
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
                      <LeftSidebarItem {...item} pageSlug={props.slug} />
                    </li>
                  </Show>
                );
              }}
            </For>
          </ul>
        </nav>
      </LeftSidebar>
    </navOpenStates.Provider>
  );
}
