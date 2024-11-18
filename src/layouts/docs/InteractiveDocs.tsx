import { createMemo, lazy, type ParentProps, Show } from "solid-js";

import { CodePanel } from "~/components/interactive-docs/CodePanel";
import { PayMethodSelect } from "~/components/interactive-docs/PayMethodSelect";
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
      <div class="sticky top-26 col-span-2 min-h-12 flex items-center gap-3 from-white bg-gradient-to-r px-6">
        <div class="rounded-md text-xs text-slate-5 font-medium">
          결제대행사 선택
        </div>
        <PgSelect />
        <div class="rounded-md text-xs text-slate-5 font-medium">
          결제수단 선택
        </div>
        <PayMethodSelect />
        <LanguageSelect languages={["frontend", "hybrid"]} title="Frontend" />
        <Show when={isHybridSelected() === false}>
          <LanguageSelect languages={"backend"} title="Backend" />
        </Show>
      </div>
      <article class="mb-40 min-w-0 flex shrink-1 basis-200 flex-col text-slate-7">
        <div class="mb-6 ml-6">
          <prose.h1 id="overview">{props.frontmatter.title}</prose.h1>
        </div>
        {props.children}
      </article>
      <CodePanel />
    </div>
  );
}
