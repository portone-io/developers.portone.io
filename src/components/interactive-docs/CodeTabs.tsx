import { Tabs } from "@kobalte/core/tabs";
import clsx from "clsx";
import { createEffect, createMemo, For, untrack } from "solid-js";

import { useInteractiveDocs } from "~/state/interactive-docs";

import { CodeIcon } from "./CodeIcon";

export function CodeTabs() {
  const { tabs, selectedTab, setSelectedTab } = useInteractiveDocs();

  const handleTabChange = (fileName: string) => {
    const tab = untrack(() => tabs()).find((tab) => tab.fileName === fileName);
    if (tab) {
      setSelectedTab(tab.fileName);
    }
  };
  return (
    <Tabs
      value={selectedTab() ?? undefined}
      onChange={handleTabChange}
      class="w-full flex overflow-x-hidden"
    >
      <Tabs.List class="w-full flex flex-nowrap gap-2 overflow-x-auto whitespace-nowrap">
        <For each={tabs()}>
          {(tab) => {
            let tabRef: HTMLElement;
            const isSelected = createMemo(() => tab.fileName === selectedTab());
            createEffect(() => {
              if (isSelected()) {
                tabRef.scrollBy();
              }
            });
            return (
              <Tabs.Trigger
                ref={tabRef!}
                class={clsx(
                  "flex items-center gap-1 rounded-md px-3 py-1",
                  isSelected()
                    ? "bg-slate-2 text-slate-9"
                    : "hover:bg-slate-5 text-slate-4 hover:text-slate-3",
                )}
                value={tab.fileName}
              >
                <CodeIcon fileName={tab.fileName} />
                <span class={clsx("text-xs font-medium leading-6")}>
                  {tab.fileName}
                </span>
              </Tabs.Trigger>
            );
          }}
        </For>
      </Tabs.List>
    </Tabs>
  );
}
