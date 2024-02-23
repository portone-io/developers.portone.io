/* @jsxImportSource solid-js */

import { clsx } from "clsx";
import { createMemo, createSignal, For, type JSX } from "solid-js";
import ClientOnly from "~/misc/clientOnly.solid";

export interface Tab<Id extends string> {
  id: Id;
  label: JSX.Element;
  render: (id: Id) => JSX.Element;
}
export interface TabsProps<Id extends string> {
  tabs: (Tab<Id> | false | 0)[];
}
export function Tabs<Id extends string>(props: TabsProps<Id>) {
  const tabs = createMemo(() => props.tabs.filter(Boolean) as Tab<Id>[]);
  const [currTabId, setCurrTabId] = createSignal(tabs()[0]?.id || "");

  const renderedTabs = createMemo<
    Record<string, { tab: Tab<Id>; el: JSX.Element }>
  >((prev) => {
    return Object.fromEntries(
      tabs().map((tab) => {
        if (prev?.[tab.id]?.tab === tab) return [tab.id, prev[tab.id]];
        return [
          tab.id,
          { tab, el: <ClientOnly>{tab.render(tab.id)}</ClientOnly> },
        ];
      }),
    ) as Record<string, { tab: Tab<Id>; el: JSX.Element }>;
  });

  return (
    <>
      <div class="text-14px flex gap-3">
        <For each={tabs()}>
          {(tab) => (
            <button
              type="button"
              style={{ "text-decoration-skip-ink": "none" }}
              class={clsx(
                "text-xs uppercase",
                currTabId() === tab.id &&
                  "underline-offset-3 decoration-1.5 font-bold underline",
              )}
              onClick={() => setCurrTabId(() => tab.id)}
            >
              {tab.label}
            </button>
          )}
        </For>
      </div>
      <div class="relative">{renderedTabs()[currTabId()]?.el}</div>
    </>
  );
}
