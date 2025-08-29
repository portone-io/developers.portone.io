import clsx from "clsx";
import { createMemo, createSignal, For, type JSXElement } from "solid-js";

export interface Tab<Id extends string> {
  id: Id;
  label: JSXElement;
  render: (id: Id) => JSXElement;
}
export interface TabsProps<Id extends string> {
  tabs: (Tab<Id> | false | 0)[];
  tabId?: string | Id;
  setTabId?: (id: string | Id) => void;
}
export function Tabs<Id extends string>(props: TabsProps<Id>) {
  const tabs = createMemo(() => props.tabs.filter(Boolean));
  const currTabId = createMemo(() => {
    if (props.tabId && props.setTabId) {
      return { get: () => props.tabId, set: props.setTabId };
    }
    const [get, set] = createSignal(tabs()[0]?.id || "");
    return { get, set };
  });
  const currTab = createMemo(() =>
    tabs().find((tab) => tab.id === currTabId().get()),
  );
  return (
    <>
      <div class="flex gap-3 text-14px">
        <For each={tabs()}>
          {(tab) => {
            const active = createMemo(() => currTabId().get() === tab.id);
            const className = createMemo(
              () =>
                `text-xs uppercase ${
                  active()
                    ? "font-bold underline underline-offset-3 decoration-1.5"
                    : ""
                }`,
            );
            return (
              <button
                style={{ "text-decoration-skip-ink": "none" }}
                class={className()}
                onClick={() => currTabId().set(tab.id)}
              >
                {tab.label}
              </button>
            );
          }}
        </For>
      </div>
      <div class="relative">
        <For each={tabs()}>
          {(tab) => (
            <div
              class={clsx(
                "relative h-full w-full",
                currTab()?.id !== tab.id && "hidden",
              )}
            >
              {tab.render(tab.id)}
            </div>
          )}
        </For>
      </div>
    </>
  );
}
