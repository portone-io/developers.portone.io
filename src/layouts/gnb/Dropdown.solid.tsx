/* @jsxImportSource solid-js */

import { For, Show, createSignal, type JSX } from "solid-js";
import { useServerFallback } from "~/misc/useServerFallback.solid";
import { systemVersion } from "~/state/nav";
import type { SystemVersion } from "~/type";

export interface DropdownProps {
  children: JSX.Element;
  link: string | Record<SystemVersion, string>;
  items: DropdownItem[];
}
export interface DropdownItem {
  label: JSX.Element;
  link: string;
  systemVersion?: SystemVersion;
}
export default function Dropdown(props: DropdownProps) {
  const [showItems, setShowItems] = createSignal(false);
  const localSystemVersion = useServerFallback<SystemVersion>(
    systemVersion,
    "all",
  );
  return (
    <div
      class="relative inline-flex h-full cursor-default flex-col items-center"
      onMouseEnter={() => setShowItems(true)}
      onMouseLeave={() => setShowItems(false)}
    >
      <a
        class="inline-flex h-full items-center"
        href={
          typeof props.link === "string"
            ? props.link
            : props.link[localSystemVersion()]
        }
      >
        {props.children}
      </a>
      <div class="relative w-full">
        <Show when={showItems()}>
          <div class="absolute flex w-max flex-col border bg-white py-2 shadow-lg">
            <For each={props.items}>
              {(item) => (
                <a
                  class="hover:bg-slate-1 inline-flex items-center gap-2 px-4 py-2"
                  data-system-version={item.systemVersion}
                  href={item.link}
                >
                  {item.label}
                  <Show when={item.link.startsWith("https://")}>
                    <i class="i-ic-baseline-launch opacity-40" />
                  </Show>
                </a>
              )}
            </For>
          </div>
        </Show>
      </div>
    </div>
  );
}
