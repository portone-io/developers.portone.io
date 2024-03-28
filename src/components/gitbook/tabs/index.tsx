import * as React from "react";

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

export function Tabs({ uniqueId, getTabs }: TabsProps) {
  const [currentTab, setCurrentTab] = React.useState(0);

  const tabs = React.useMemo(() => getTabs?.() ?? hydrateTabs(uniqueId), []);

  return (
    <div data-unique-id={uniqueId} class="my-4 flex flex-col">
      <div class="flex -mb-px">
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
            ? "shrink-0 border-b-white bg-white z-selected-tab"
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
      <div class="border rounded rounded-tl-none px-6 py-4">
        {tabs.map(
          (tab, index) =>
            tab && (
              <div
                key={index}
                class={index === currentTab ? "" : "hidden"}
                data-gitbook-tab={index}
                data-gitbook-tab-title={tab.title}
                dangerouslySetInnerHTML={{ __html: tab.html }}
              />
            ),
        )}
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
