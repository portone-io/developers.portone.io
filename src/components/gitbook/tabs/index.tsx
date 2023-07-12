import * as React from "react";

export interface TabsProps {
  children: React.ReactNode; // <astro-slot>
}
export const Tabs: React.FC<TabsProps> = ({ children }) => {
  const tabsRef = React.useRef<HTMLDivElement>(null);
  const latestTabsRef = React.useRef<HTMLDivElement[]>([]);
  const [currentTab, setCurrentTab] = React.useState(0);
  const [titles, setTitles] = React.useState<string[]>([]);

  const setupTitles = () => {
    const tabs = getTabElements(tabsRef.current);
    setTitles(tabs.map((tab) => tab.dataset.title!));
  };
  const updateTabVisibility = () => {
    for (const tab of latestTabsRef.current) {
      tab.style.display = "none";
    }
    const tabs = getTabElements(tabsRef.current);
    tabs.forEach((tab, index) => {
      tab.style.display = index === currentTab ? "block" : "none";
    });
    latestTabsRef.current = tabs;
  };

  React.useEffect(setupTitles, []);
  React.useLayoutEffect(updateTabVisibility, [titles, currentTab]);

  React.useEffect(() => {
    const tabsEl = tabsRef.current;
    if (!tabsEl) return;
    const observer = new MutationObserver(() => {
      setupTitles();
    });
    observer.observe(tabsEl, { attributeFilter: ["hidden"], subtree: true });
    return () => observer.disconnect();
  }, [tabsRef.current]);

  return (
    <div ref={tabsRef} class="my-4 flex flex-col">
      <div class="-mb-px flex">
        {titles.map((title, index) => {
          const isFirst = index === 0;
          const isLast = index === titles.length - 1;
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
      <div class="rounded rounded-tl-none border px-6 py-4">{children}</div>
    </div>
  );
};

function getTabElements(container?: Element | null) {
  if (!container) return [];
  const tabs = Array.from(
    container.querySelectorAll("[data-gitbook-tab]")
  ) as HTMLDivElement[];
  const hiddenTabs = Array.from(
    container.querySelectorAll("[hidden] [data-gitbook-tab]")
  ) as HTMLDivElement[];
  return tabs.filter((tab) => !hiddenTabs.includes(tab));
}

export interface TabProps {
  title: string;
  children: React.ReactNode;
}
export const Tab: React.FC<TabProps> = ({ children, title }) => {
  return (
    <div data-gitbook-tab data-title={title}>
      {children}
    </div>
  );
};
