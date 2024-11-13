import { createSignal } from "solid-js";

import { CodeTabs } from "./CodeTabs";

interface CodeViewerProps {}

export default function CodeViewer(props: CodeViewerProps) {
  const tabs = ["server.js", "App.jsx"];
  const [selectedTab, setSelectedTab] = createSignal(tabs[0]!);
  return (
    <div class="grid grid-rows-[min-content_1fr] gap-y-2 rounded-t-xl bg-slate-8 p-2">
      <div class="grid grid-cols-[1fr_min-content] h-12 items-center gap-2 rounded-lg bg-slate-7 p-2">
        <CodeTabs
          tabs={tabs}
          selectedTab={selectedTab()}
          onChange={setSelectedTab}
        />
        <button class="px-2 text-slate-5" type="button">
          <i class="i-material-symbols-content-copy-outline inline-block text-xl" />
        </button>
      </div>
    </div>
  );
}
