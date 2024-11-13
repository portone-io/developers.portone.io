import { writeClipboard } from "@solid-primitives/clipboard";
import { createMemo, createResource, untrack } from "solid-js";

import { useInteractiveDocs } from "~/state/interactive-docs";

import { CodeTabs } from "./CodeTabs";

export function CodeRenderer() {
  const { selectedTab, highlighter } = useInteractiveDocs();
  const code = createMemo(
    () => {
      return highlighter()?.codeToHtml(selectedTab()?.code ?? "", {
        theme: "one-dark-pro",
        lang: "javascript",
        colorReplacements: {
          "one-dark-pro": {
            "#282c34": "#1e293b",
          },
        },
      });
    },
    { deferStream: true },
  );
  const [, { refetch: copyToClipboard }] = createResource(() => {
    const _selectedTab = selectedTab();
    if (!_selectedTab) return;
    return writeClipboard(untrack(() => _selectedTab.code));
  });

  return (
    <div class="grid grid-rows-[min-content_1fr] gap-y-2 rounded-t-xl bg-slate-8 p-2">
      <div class="grid grid-cols-[1fr_min-content] h-12 items-center gap-2 rounded-lg bg-slate-7 p-2">
        <CodeTabs />
        <button
          class="flex rounded-md px-2 py-1 text-slate-4 hover:bg-slate-5 hover:text-slate-3"
          type="button"
          onClick={() => void copyToClipboard()}
        >
          <i class="i-material-symbols-content-copy-outline inline-block text-xl" />
        </button>
      </div>
      <div
        innerHTML={code()}
        class="overflow-auto text-xs [&_code]:[counter-increment:step_0] [&_code]:[counter-reset:step] [&_code_.line]:before:[content:counter(step)] [&_code_.line]:before:[counter-increment:step] [&_code_.line]:before:mr-6 [&_code_.line]:before:inline-block [&_code_.line]:before:w-4 [&_code_.line]:before:text-right [&_code_.line]:before:text-slate-5"
      />
    </div>
  );
}
