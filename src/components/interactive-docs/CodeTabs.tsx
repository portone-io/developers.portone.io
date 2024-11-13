import { Tabs } from "@kobalte/core/tabs";
import clsx from "clsx";
import { For } from "solid-js";

import { CodeIcon } from "./CodeIcon";

interface CodeTabsProps {
  tabs: string[];
  selectedTab: string;
  onChange: (tab: string) => void;
}

export function CodeTabs(props: CodeTabsProps) {
  return (
    <Tabs
      value={props.selectedTab}
      onChange={props.onChange}
      class="w-full flex overflow-x-hidden"
    >
      <Tabs.List class="w-full flex flex-nowrap gap-2 overflow-x-auto whitespace-nowrap">
        <For each={props.tabs}>
          {(tab) => (
            <Tabs.Trigger
              class={clsx(
                "flex items-center gap-1 rounded-md px-3 py-1",
                tab === props.selectedTab
                  ? "bg-slate-2 text-slate-9"
                  : "hover:bg-slate-5 text-slate-4 hover:text-slate-3",
              )}
              value={tab}
            >
              <CodeIcon fileName={tab} />
              <span class={clsx("text-xs font-medium leading-6")}>{tab}</span>
            </Tabs.Trigger>
          )}
        </For>
      </Tabs.List>
    </Tabs>
  );
}
