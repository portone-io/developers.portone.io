import { useSignal } from "@preact/signals";

export interface Tab<Id extends string> {
  id: Id;
  label: any;
  render: (id: Id) => any;
}
export interface TabsProps<Id extends string> {
  tabs: (Tab<Id> | false | 0)[];
}
export function Tabs<Id extends string>({ tabs }: TabsProps<Id>) {
  const _tabs = tabs.filter(Boolean) as Tab<Id>[];
  const currTabIdSignal = useSignal(_tabs[0]?.id || "");
  const currTabId = currTabIdSignal.value;
  const currTab = _tabs.find((tab) => tab.id === currTabId);
  return (
    <>
      <div class="text-14px flex gap-3">
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
