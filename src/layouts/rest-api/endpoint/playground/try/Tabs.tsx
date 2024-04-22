import { Signal, useSignal } from "@preact/signals";
import type React from "preact/compat";

export interface Tab<Id extends string> {
  id: Id;
  label: React.ReactNode;
  render: (id: Id) => React.ReactNode;
}
export interface TabsProps<Id extends string> {
  tabs: (Tab<Id> | false | 0)[];
  tabIdSignal?: Signal<string | Id>;
}
export function Tabs<Id extends string>({ tabs, tabIdSignal }: TabsProps<Id>) {
  const _tabs = tabs.filter(Boolean);
  const currTabIdSignal = tabIdSignal ?? useSignal(_tabs[0]?.id || "");
  const currTabId = currTabIdSignal.value;
  const currTab = _tabs.find((tab) => tab.id === currTabId);
  return (
    <>
      <div class="flex gap-3 text-14px">
        {_tabs.map((tab) => {
          const active = currTabId === tab.id;
          const className = `text-xs uppercase ${
            active
              ? "font-bold underline underline-offset-3 decoration-1.5"
              : ""
          }`;
          return (
            <button
              key={tab.id}
              style={{ "text-decoration-skip-ink": "none" }}
              class={className}
              onClick={() => (currTabIdSignal.value = tab.id)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div class="relative">{currTab && currTab.render(currTab.id)}</div>
    </>
  );
}
