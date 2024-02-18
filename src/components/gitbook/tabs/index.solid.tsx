/* @jsxImportSource solid-js */

import { clsx } from "clsx";
import { For, createMemo, createSignal } from "solid-js";

export interface Tab {
  title: string;
  html: string;
}

export const processTabs = (html: string) => {
  const matches = html.matchAll(
    /<gitbook-tab[^>]*title="([^"]*)"[^>]*>([\s\S]+?)<\/gitbook-tab>/g,
  );
  return [...matches]
    .map(([, title, html]) => title && html && { title, html })
    .filter(Boolean) as Tab[];
};

export interface TabsProps {
  uniqueId: string;
  /** JSON serializable하지 않기 때문에 서버에서만 존재함 */
  getTabs?: () => Tab[];
}

export function Tabs(props: TabsProps) {
  const [currentTab, setCurrentTab] = createSignal(0);

  const tabs = createMemo(
    () => props.getTabs?.() ?? hydrateTabs(props.uniqueId),
  );

  return (
    <div data-unique-id={props.uniqueId} class="my-4 flex flex-col">
      <div class="-mb-px flex">
        <For each={tabs()}>
          {(tab, index) => {
            const isFirst = createMemo(() => index() === 0);
            const isLast = createMemo(() => index() === tabs.length - 1);
            const selected = createMemo(() => index() === currentTab());
            return (
              <button
                type="button"
                onClick={() => setCurrentTab(index())}
                class={clsx(
                  "border px-4 py-2 text-sm",
                  isFirst()
                    ? isLast()
                      ? "rounded-t"
                      : "rounded-tl"
                    : isLast()
                      ? "-ml-px rounded-tr"
                      : "-ml-px",
                  selected()
                    ? "z-1 shrink-0 border-b-white bg-white"
                    : "text-slate bg-slate-1 shrink overflow-hidden text-ellipsis whitespace-nowrap",
                )}
              >
                {tab.title}
              </button>
            );
          }}
        </For>
      </div>
      <div class="rounded rounded-tl-none border px-6 py-4">
        <For each={tabs()}>
          {(tab, index) => (
            <div
              class={clsx(index() === currentTab() && "hidden")}
              data-gitbook-tab={index()}
              data-gitbook-tab-title={tab.title}
              innerHTML={tab.html}
            />
          )}
        </For>
      </div>
    </div>
  );
}

function hydrateTabs(uniqueId: string) {
  const wrapper = document.querySelector(`[data-unique-id="${uniqueId}"]`);
  if (!wrapper) return [];
  const tabs = [...wrapper.querySelectorAll("[data-gitbook-tab]")];
  return tabs
    .toSorted(
      (a, b) =>
        Number(a.getAttribute("data-gitbook-tab")) -
        Number(b.getAttribute("data-gitbook-tab")),
    )
    .map((tab) => ({
      title: tab.getAttribute("data-gitbook-tab-title") || "",
      html: tab.innerHTML,
    }));
}
