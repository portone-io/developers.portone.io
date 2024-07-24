import { A } from "@solidjs/router";
import clsx from "clsx";
import { createSignal, For, type JSXElement, Show } from "solid-js";

export interface DropdownLinkProps {
  items: DropdownItem[];
  pathname: string;
}
export interface DropdownItem {
  label: JSXElement;
  link: string;
}
export default function DropdownLink(props: DropdownLinkProps) {
  const [showItems, setShowItems] = createSignal(false);

  return (
    <div class="relative h-full w-full flex flex-col cursor-default">
      <button
        class="flex flex-1 items-center gap-2 border-1 border-slate-3 rounded-6px p-2 px-4 text-slate-600"
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
            "i-ic-baseline-keyboard-arrow-up": showItems(),
            "i-ic-baseline-keyboard-arrow-down": !showItems(),
          }}
        ></i>
      </button>
      <div class="relative w-full z-dropdown-link">
        <Show when={showItems()}>
          <div class="absolute w-full flex flex-col border bg-white py-2 shadow-lg">
            <For each={props.items}>
              {(item) => (
                <A
                  class="inline-flex items-center gap-2 px-4 py-2 hover:bg-slate-1"
                  href={item.link}
                >
                  <i
                    class={clsx(
                      "i-ic-baseline-check",
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
