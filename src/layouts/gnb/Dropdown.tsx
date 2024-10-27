import { A } from "@solidjs/router";
import { createMemo, createSignal, For, type JSXElement, Show } from "solid-js";

import { useSystemVersion } from "~/state/system-version";
import type { SystemVersion } from "~/type";

export interface DropdownProps {
  children: JSXElement;
  link?: string | Record<SystemVersion, string>;
  items?: DropdownItem[];
  serverSystemVersion: SystemVersion;
}
export interface DropdownItem {
  label: JSXElement;
  link?: string | Record<SystemVersion, string>;
  systemVersion?: SystemVersion;
}
export default function Dropdown(props: DropdownProps) {
  const [showItems, setShowItems] = createSignal(false);
  const { systemVersion } = useSystemVersion();
  const link = createMemo(() => {
    if (!props.link) return null;
    if (typeof props.link === "string") return props.link;
    return props.link[systemVersion()];
  });

  return (
    <div
      class="relative h-full inline-flex flex-col cursor-default items-center"
      onMouseEnter={() => setShowItems(true)}
      onMouseLeave={() => setShowItems(false)}
    >
      <Show
        when={link()}
        fallback={
          <div class="h-full inline-flex items-center"> {props.children} </div>
        }
      >
        {(link) => (
          <A class="h-full inline-flex items-center" href={link()}>
            {" "}
            {props.children}{" "}
          </A>
        )}
      </Show>
      <Show when={showItems() && props.items}>
        <div class="relative w-full <md:hidden">
          <div class="absolute w-max flex flex-col border bg-white py-2 shadow-lg">
            <For each={props.items}>
              {(item) => {
                const link = createMemo(() => {
                  if (!item.link) return "";
                  if (typeof item.link === "string") return item.link;
                  return item.link[item.systemVersion ?? systemVersion()];
                });
                const isExternalLink = createMemo(() =>
                  link().startsWith("https://"),
                );
                return (
                  <A
                    class="inline-flex items-center gap-2 px-4 py-2 hover:bg-slate-1"
                    data-system-version={systemVersion}
                    href={link()}
                    target={isExternalLink() ? "_blank" : undefined} // _self 로 설정하면 라우터가 먹히지 않음
                  >
                    {item.label}
                    {isExternalLink() && (
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
