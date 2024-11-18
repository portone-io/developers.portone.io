import { A, useLocation } from "@solidjs/router";
import { createMemo, createSignal, For, type JSXElement, Show } from "solid-js";

import { useSystemVersion } from "~/state/system-version";
import type { SystemVersion } from "~/type";

export interface DropdownProps {
  children: JSXElement;
  link?: string | Record<SystemVersion, string>;
  items?: DropdownItem[];
  serverSystemVersion: SystemVersion;
  activeLink?: string[];
}
export interface DropdownItem {
  label: JSXElement;
  link?: string | Record<SystemVersion, string>;
  systemVersion?: SystemVersion;
}
export default function Dropdown(props: DropdownProps) {
  const [showItems, setShowItems] = createSignal(false);
  const { systemVersion } = useSystemVersion();
  const linkResolver = (
    link: string | Record<SystemVersion, string> | null | undefined,
  ) => {
    if (!link) return null;
    if (typeof link === "string") return link;
    return link[systemVersion()];
  };
  const link = createMemo(() => linkResolver(props.link));
  const location = useLocation();
  const isActive = createMemo<boolean>(() => {
    const _link = link();
    if (!_link) return false;
    return [...(props.activeLink ?? []), _link].some((link) => {
      return location.pathname.startsWith(link);
    });
  });
  const [hasActiveItem, setHasActiveItem] = createSignal(false);
  const items = createMemo(() => {
    if (!props.items) return [];
    const items = props.items.map((item) => {
      const link = linkResolver(item.link);
      const isExternalLink = link && URL.canParse(link);
      const isActive: boolean =
        isExternalLink === false &&
        location.pathname.startsWith(link?.replace(/\/readme$/g, "") ?? "");
      return {
        ...item,
        link,
        isExternalLink,
        isActive,
      };
    });
    setHasActiveItem(items.some((item) => item.isActive));
    return items;
  });

  return (
    <div
      class="relative inline-flex flex-col cursor-default items-center"
      onMouseEnter={() => setShowItems(true)}
      onMouseLeave={() => setShowItems(false)}
    >
      <Show
        when={link()}
        fallback={
          <div class="inline-flex items-center"> {props.children} </div>
        }
      >
        {(link) => (
          <A
            class="inline-flex items-center rounded-md text-sm text-slate-9 font-medium data-[active]:text-portone hover:text-slate-5"
            bool:data-active={isActive() || hasActiveItem()}
            href={link()}
          >
            {" "}
            {props.children}{" "}
          </A>
        )}
      </Show>
      <Show when={showItems() && items() && items().length > 0}>
        <div class="relative w-full <md:hidden">
          <div class="absolute min-w-30 w-max flex flex-col gap-.5 border rounded-lg bg-white p-2 shadow-lg">
            <For each={items()}>
              {(item) => {
                return (
                  <A
                    class="inline-flex items-center gap-2 px-2 py-2.5 text-sm text-slate-9 data-[active]:text-portone hover:text-slate-5"
                    bool:data-active={item.isActive}
                    data-system-version={item.systemVersion}
                    href={item.link ?? "#"}
                    target={item.isExternalLink ? "_blank" : undefined} // _self 로 설정하면 라우터가 먹히지 않음
                  >
                    {item.label}
                    {item.isExternalLink && (
                      <i class="i-ic-baseline-launch opacity-40" />
                    )}
                  </A>
                );
              }}
            </For>
          </div>
        </div>
      </Show>
    </div>
  );
}
