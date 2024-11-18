import { writeClipboard } from "@solid-primitives/clipboard";
import type { ShikiTransformer } from "shiki/core";
import { createEffect, createMemo, getOwner, on, runWithOwner } from "solid-js";

import { useInteractiveDocs } from "~/state/interactive-docs";

import { CodeTabs } from "./CodeTabs";

export function CodeRenderer() {
  const { selectedTab, tabs, highlighter, highlightSection } =
    useInteractiveDocs();
  const currentTab = createMemo(() =>
    tabs().find((tab) => tab.fileName === selectedTab()),
  );
  const code = createMemo(
    () => {
      const section = highlightSection();
      const lineHighlighter: ShikiTransformer | undefined =
        section && section.fileName === selectedTab()
          ? {
              line(hast, line) {
                this.addClassToHast(hast, "inline-flex w-full");
                if (line >= section.startLine && line <= section.endLine) {
                  hast.properties["data-highlighted"] = true;
                  this.addClassToHast(hast, "bg-slate-7");
                }
              },
            }
          : undefined;
      const code = currentTab()?.code;
      if (!code) return;
      return highlighter()?.codeToHtml(code, {
        theme: "one-dark-pro",
        lang: "javascript",
        colorReplacements: {
          "one-dark-pro": {
            "#282c34": "#1e293b",
          },
        },
        transformers: [lineHighlighter].filter(Boolean),
      });
    },
    { deferStream: true },
  );
  let rendererRef: HTMLDivElement;
  // highlightSection이 변경될 때만 Section으로 스크롤 하도록 구현
  createEffect(
    on(highlightSection, (section) => {
      if (!section) return;
      const owner = getOwner();
      setTimeout(() => {
        runWithOwner(owner, () => {
          rendererRef.scrollTo({
            top: Math.max(section.startLine - 1, 0) * 16,
            behavior: "smooth",
          });
        });
      }, 0);
    }),
  );

  return (
    <div class="grid grid-rows-[min-content_1fr] gap-y-2 overflow-auto rounded-t-xl bg-slate-8 pb-2">
      <div class="grid grid-cols-[1fr_min-content] h-12 items-center gap-2 rounded-lg bg-slate-7 p-2">
        <CodeTabs />
        <button
          class="flex rounded-md px-2 py-1 text-slate-4 hover:bg-slate-5 hover:text-slate-3"
          type="button"
          onClick={() => {
            const code = currentTab()?.code;
            if (code) {
              void writeClipboard(code);
            }
          }}
        >
          <i class="i-material-symbols-content-copy-outline inline-block text-xl" />
        </button>
      </div>
      <div
        ref={rendererRef!}
        innerHTML={code()}
        class="overflow-auto text-xs [&_code]:[counter-increment:step_0] [&_code]:[counter-reset:step] [&_code_.line]:before:[content:counter(step)] [&_code_.line]:before:[counter-increment:step] [&_code_.line]:before:mr-6 [&_code_.line]:before:inline-block [&_code_.line]:before:w-4 [&_code_.line]:before:text-right [&_code_.line]:before:text-slate-5"
      />
    </div>
  );
}
