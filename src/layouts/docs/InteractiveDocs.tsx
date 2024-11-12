import { createMemo, lazy, type ParentProps, Show } from "solid-js";

import { CodePanel } from "~/components/interactive-docs/CodePanel";
import { PgSelect } from "~/components/interactive-docs/PgSelect";
import * as prose from "~/components/prose";
import type { DocsEntry } from "~/content/config";
import type { loadDoc } from "~/misc/docs";
import { useInteractiveDocs } from "~/state/interactive-docs";
import type { Lang } from "~/type";

const LanguageSelect = lazy(
  () => import("~/components/interactive-docs/LanguageSelect"),
);

export function InteractiveDocs(
  props: ParentProps<{
    frontmatter: DocsEntry;
    params: { lang: Lang; slug: string };
    doc: Awaited<ReturnType<typeof loadDoc> | undefined>;
  }>,
) {
  const {
    pgOptions,
    selectedPg,
    setSelectedPg,
    languages,
    selectedLanguage,
    setSelectedLanguage,
  } = useInteractiveDocs();
  const frontendLanguages = createMemo(() => [
    ...languages().frontend,
    ...languages().hybrid,
  ]);
  const isHybridSelected = createMemo(() => {
    if (Array.isArray(selectedLanguage())) {
      return false;
    }
    return true;
  });
  return (
    <div class="grid grid-cols-[1.2fr_1fr] grid-rows-[auto_1fr] flex-1 gap-y-2">
      <div class="col-span-2 flex items-center gap-4 px-6 py-2">
        <div class="rounded-md bg-[#E5E7EB] px-2.5 py-.75 text-xs color-slate-5 font-medium">
          결제대행사
        </div>
        <PgSelect
          options={pgOptions()}
          value={selectedPg()}
          onChange={setSelectedPg}
        />
        <LanguageSelect
          languages={frontendLanguages()}
          title="Frontend"
          selectedLanguage={
            isHybridSelected()
              ? (selectedLanguage() as string)
              : selectedLanguage()[0]
          }
          onChange={(language) => {
            if (languages().hybrid.includes(language)) {
              setSelectedLanguage(language);
              return;
            }
            setSelectedLanguage((prev) => {
              if (Array.isArray(prev)) {
                return [language, prev[1]];
              }
              return [language, languages().backend[0]];
            });
          }}
        />
        <Show when={isHybridSelected() === false}>
          {(_) => {
            const backendLanguages = createMemo(() => [...languages().backend]);
            return (
              <LanguageSelect
                languages={backendLanguages()}
                title="Backend"
                selectedLanguage={selectedLanguage()[1]}
                onChange={(language) => {
                  setSelectedLanguage((prev) => {
                    if (Array.isArray(prev)) {
                      return [prev[0], language];
                    }
                    return prev;
                  });
                }}
              />
            );
          }}
        </Show>
      </div>
      <article class="mb-40 mt-4 min-w-0 flex shrink-1 basis-200 flex-col text-slate-7">
        <div class="mb-6 ml-6">
          <prose.h1 id="overview">{props.frontmatter.title}</prose.h1>
          <Show when={props.frontmatter.description}>
            <p class="my-4 text-[18px] text-gray font-400 leading-[28.8px]">
              {props.frontmatter.description}
            </p>
          </Show>
        </div>
        {props.children}
      </article>
      <CodePanel />
    </div>
  );
}
