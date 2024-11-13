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
  const { selectedLanguage } = useInteractiveDocs();
  const isHybridSelected = createMemo(() => !Array.isArray(selectedLanguage()));
  return (
    <div class="grid grid-cols-[1fr_1.2fr] grid-rows-[auto_1fr] flex-1 gap-y-2">
      <div class="sticky top-26 col-span-2 flex items-center gap-4 from-white bg-gradient-to-r px-6 py-2">
        <div class="rounded-md bg-[#E5E7EB] px-2.5 py-.75 text-xs color-slate-5 font-medium">
          결제대행사
        </div>
        <PgSelect />
        <LanguageSelect languages={["frontend", "hybrid"]} title="Frontend" />
        <Show when={isHybridSelected() === false}>
          <LanguageSelect languages={"backend"} title="Backend" />
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
