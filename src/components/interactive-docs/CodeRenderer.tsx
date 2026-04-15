import { writeClipboard } from "@solid-primitives/clipboard";
import type { ShikiTransformer } from "shiki/core";
import { createEffect, createMemo, getOwner, on, runWithOwner } from "solid-js";

import { useInteractiveDocs } from "~/state/interactive-docs";
import { useTheme } from "~/state/theme";

import { CodeTabs } from "./CodeTabs";

export function CodeRenderer() {
  const { selectedTab, tabs, highlighter, highlightSection } =
    useInteractiveDocs();
  const { theme } = useTheme();
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
        themes: {
          light: "github-light",
          dark: "one-dark-pro",
        },
        lang: currentTab()?.language ?? "javascript",
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
  let copyButtonRef: HTMLButtonElement;
  // highlightSection이 변경될 때만 Section으로 스크롤 하도록 구현
  createEffect(
    on(highlightSection, (section) => {
      if (!section) return;
      const owner = getOwner();
      setTimeout(() => {
        runWithOwner(owner, () => {
          rendererRef!.scrollTo({
            top: Math.max(section.startLine - 1, 0) * 16,
            behavior: "smooth",
          });
        });
      }, 0);
    }),
  );

  return (
    <div class="grid grid-rows-[min-content_1fr] gap-y-2 overflow-auto rounded-t-xl border border-border-default bg-surface-elevated pb-2">
      <div class="grid h-12 grid-cols-[1fr_min-content] items-center gap-2 rounded-lg bg-surface-muted p-2">
        <CodeTabs />
        <button
          ref={copyButtonRef!}
          class="icon-[mdi--content-copy] h-5 w-5 rounded-md p-1 text-xl text-text-tertiary data-copied:icon-[mdi--check] data-copied:text-green-5 [&:not([data-copied])]:hover:text-text-primary"
          onPointerLeave={() => {
            delete copyButtonRef!.dataset.copied;
          }}
          type="button"
          onClick={() => {
            const code = currentTab()?.code;
            if (code) {
              void writeClipboard(code).then(() => {
                copyButtonRef!.dataset.copied = "true";
              });
            }
          }}
        />
      </div>
      <div
        ref={rendererRef!}
        innerHTML={code()}
        data-theme={theme()}
        class="overflow-auto text-xs [&_.shiki]:min-h-full [&_.shiki]:!bg-transparent [&_.shiki]:![color:var(--shiki-light)] dark:[&_.shiki]:![color:var(--shiki-dark)] [&_code]:[counter-increment:step_0] [&_code]:[counter-reset:step] [&_code_.line]:before:mr-6 [&_code_.line]:before:inline-block [&_code_.line]:before:w-4 [&_code_.line]:before:text-right [&_code_.line]:before:text-text-tertiary [&_code_.line]:before:content-[counter(step)] [&_code_.line]:before:[counter-increment:step]"
      />
    </div>
  );
}
