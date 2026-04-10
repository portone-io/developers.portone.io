import { A } from "@solidjs/router";
import clsx from "clsx";
import { createSignal, For, type JSXElement, Show } from "solid-js";

import type { SystemVersion } from "~/type";

export interface DropdownLinkProps {
  items: DropdownItem[];
  pathname: string;
}
export interface DropdownItem {
  label: JSXElement;
  link: string;
}

export const getDropdownLinks = (systemVersion: SystemVersion) => [
  { label: "원 페이먼트 인프라", link: "/opi/ko" },
  { label: "REST API", link: `/api/rest-${systemVersion}` },
  { label: "포트원 SDK", link: "/sdk/ko" },
  { label: "파트너 정산 자동화", link: "/platform/ko" },
  { label: "릴리스 노트", link: "/release-notes" },
  { label: "기술 블로그", link: "/blog" },
];

export default function DropdownLink(props: DropdownLinkProps) {
  const [showItems, setShowItems] = createSignal(false);

  return (
    <div class="relative flex h-full w-full cursor-default flex-col">
      <button
        class="border-slate-3 flex flex-1 items-center gap-2 rounded-[6px] border p-2 px-4 text-slate-600"
        onClick={() => setShowItems((prev) => !prev)}
      >
        <span>
          {props.items.find(({ link }) => props.pathname.startsWith(link))
            ?.label ?? "Unknown"}
        </span>
        <div class="flex-1" />
        <i
          class="text-xl"
          classList={{
            "icon-[ic--baseline-keyboard-arrow-up]": showItems(),
            "icon-[ic--baseline-keyboard-arrow-down]": !showItems(),
          }}
        ></i>
      </button>
      <div class="z-dropdown-link relative w-full">
        <Show when={showItems()}>
          <div class="absolute flex w-full flex-col border bg-white py-2 shadow-lg">
            <For each={props.items}>
              {(item) => (
                <A
                  class="hover:bg-slate-1 inline-flex items-center gap-2 px-4 py-2"
                  href={item.link}
                >
                  <i
                    class={clsx(
                      "icon-[ic--baseline-check]",
                      props.pathname.startsWith(item.link) || "opacity-0",
                    )}
                  />
                  <span>{item.label}</span>
                </A>
              )}
            </For>
          </div>
        </Show>
      </div>
    </div>
  );
}
