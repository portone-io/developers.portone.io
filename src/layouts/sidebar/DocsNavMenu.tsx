import { useLocation } from "@solidjs/router";
import { For, Show } from "solid-js";

import { navMenu } from "#navMenu";
import { PgSelect } from "~/components/PgSelect";
import type { DocsEntry } from "~/content/config";
import { useSystemVersion } from "~/state/system-version";
import type { Lang } from "~/type";

import { VersionSwitch } from "../gnb/VersionSwitch";
import DropdownLink, { getDropdownLinks } from "./DropdownLink";
import LeftSidebar from "./LeftSidebar";
import LeftSidebarItem from "./LeftSidebarItem";

interface Props {
  docData: Pick<DocsEntry, "versionVariants" | "targetVersions" | "targetPg">;
  nav: string;
  lang: Lang;
  slug: string;
}

export default function DocsNavMenu(props: Props) {
  const { systemVersion } = useSystemVersion();
  const location = useLocation();
  const navMenuItems = () =>
    navMenu.ko[props.nav as keyof typeof navMenu.ko] || [];

  return (
    <LeftSidebar>
      <div class="pt-5 pr-4">
        <div class="md:hidden">
          <DropdownLink
            pathname={location.pathname}
            items={getDropdownLinks(systemVersion())}
          />
          <div class="my-4 h-[1px] bg-slate-200"></div>
        </div>
      </div>
      <nav
        id="nav-menu"
        class="scrollbar-thin relative flex-1 overflow-y-scroll"
      >
        <div class="pr-6 pb-1 pl-2">
          <VersionSwitch docData={props.docData} />
        </div>
        <Show when={props.docData.targetPg === "dynamic"}>
          <section class="grid grid-cols-[auto_1fr] items-center justify-center pr-2 pb-1 pl-2">
            <div class="text-slate-5 rounded-md text-xs font-medium">
              결제대행사
            </div>
            <PgSelect />
          </section>
        </Show>
        <ul class="flex flex-col gap-1 pr-4 pb-4">
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
                        <span class="font-medium">{item.label}</span>
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
