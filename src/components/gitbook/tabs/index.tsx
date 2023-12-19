import * as React from "react";
import { useServerFallback } from "~/misc/useServerFallback";

export interface Tab {
  title: string;
  html: string;
}

export const processTabs = (html: string) => {
  const matches = html.matchAll(
    /<gitbook-tab[^>]*title="([^"]*)"[^>]*>([\s\S]+?)<\/gitbook-tab>/g
  );
  return [...matches]
    .map(([, title, html]) => title && html && { title, html })
    .filter(Boolean) as Tab[];
};

export interface TabsProps {
  tabs: Tab[];
}

export function Tabs({ tabs }: TabsProps) {
  const [currentTab, setCurrentTab] = React.useState(0);

  // 최초로 보여지지 않을 탭은 클라이언트에서 렌더링
  const tabsToRender = useServerFallback(
    tabs,
    tabs.map((tab, index) => (index === currentTab ? tab : null))
  );

  return (
    <div class="my-4 flex flex-col">
      <div class="-mb-px flex">
        {tabs.map(({ title }, index) => {
          const isFirst = index === 0;
          const isLast = index === tabs.length - 1;
          const selected = index === currentTab;
          const cornerStyle = isFirst
            ? isLast
              ? "rounded-t"
              : "rounded-tl"
            : isLast
            ? "-ml-px rounded-tr"
            : "-ml-px";
          const selectedStyle = selected
            ? "shrink-0 border-b-white bg-white z-1"
            : "shrink text-ellipsis overflow-hidden whitespace-nowrap text-slate bg-slate-1";
          return (
            <button
              key={index}
              onClick={() => setCurrentTab(index)}
              class={`border px-4 py-2 text-sm ${selectedStyle} ${cornerStyle}`}
            >
              {title}
            </button>
          );
        })}
      </div>
      <div class="rounded rounded-tl-none border px-6 py-4">
        {tabsToRender.map(
          (tab, index) =>
            tab && (
              <div
                key={index}
                class={index === currentTab ? "" : "hidden"}
                dangerouslySetInnerHTML={{ __html: tab.html }}
              />
            )
        )}
      </div>
    </div>
  );
}
