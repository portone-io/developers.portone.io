import { A } from "@solidjs/router";
import { createMemo, createSignal, For, type JSXElement } from "solid-js";

import { useSystemVersion } from "~/state/system-version";
import type { SystemVersion } from "~/type";

export interface DropdownProps {
  children: JSXElement;
  link: string | Record<SystemVersion, string>;
  items: DropdownItem[];
  serverSystemVersion: SystemVersion;
}
export interface DropdownItem {
  label: JSXElement;
  link: string;
  systemVersion?: SystemVersion;
}
export default function Dropdown(props: DropdownProps) {
  const [showItems, setShowItems] = createSignal(false);
  const { systemVersion } = useSystemVersion();

  return (
    <div
      class="relative h-full inline-flex flex-col cursor-default items-center"
      onMouseEnter={() => setShowItems(true)}
      onMouseLeave={() => setShowItems(false)}
    >
      <A
        class="h-full inline-flex items-center"
        href={
          typeof props.link === "string"
            ? props.link
            : props.link[systemVersion()]
        }
      >
        {props.children}
      </A>
      <div class="relative w-full">
        {showItems() && (
          <div class="absolute w-max flex flex-col border bg-white py-2 shadow-lg">
            <For each={props.items}>
              {(item) => {
                const isExternalLink = createMemo(() =>
                  item.link.startsWith("https://"),
                );
                return (
                  <A
                    class="inline-flex items-center gap-2 px-4 py-2 hover:bg-slate-1"
                    data-system-version={systemVersion}
                    href={item.link}
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
        )}
      </div>
    </div>
  );
}
