import { createMemo, type ParentProps, Show } from "solid-js";
import { MDXProvider } from "solid-mdx";

import { CodePanel } from "~/components/interactive-docs/CodePanel";
import LanguageSelect from "~/components/interactive-docs/LanguageSelect";
import { PayMethodSelect } from "~/components/interactive-docs/PayMethodSelect";
import { PgSelect } from "~/components/PgSelect";
import { prose } from "~/components/prose";
import type { DocsEntry } from "~/content/config";
import { type loadDoc } from "~/misc/docs";
import { useInteractiveDocs } from "~/state/interactive-docs";
import type { Lang } from "~/type";

export function InteractiveDocs(
  props: ParentProps<{
    frontmatter: DocsEntry;
    params: { lang: Lang; slug: string };
    doc: Awaited<ReturnType<typeof loadDoc> | undefined>;
  }>,
) {
  const { selectedLanguage, pgOptions } = useInteractiveDocs();
  const isHybridSelected = createMemo(() => !Array.isArray(selectedLanguage()));
  return (
    <div class="grid flex-1 grid-cols-[1fr_1.2fr] grid-rows-[auto_1fr] gap-y-2">
      <div class="sticky top-[55px] z-sticky-layout col-span-2 flex min-h-12 flex-wrap items-center gap-3 bg-gradient-to-r from-white px-6 md:top-26">
        <section class="flex flex-row items-center">
          <div class="rounded-md text-xs font-medium text-slate-5">
            결제대행사
          </div>
          <PgSelect
            options={Object.keys(pgOptions()) as (keyof typeof pgOptions)[]}
          />
        </section>
        <section class="flex flex-row items-center">
          <div class="rounded-md text-xs font-medium text-slate-5">
            결제수단
          </div>
          <PayMethodSelect />
        </section>
        <LanguageSelect languages={["frontend", "hybrid"]} title="Frontend" />
        <Show when={isHybridSelected() === false}>
          <LanguageSelect languages={"backend"} title="Backend" />
        </Show>
      </div>
      <article class="mb-40 flex min-w-0 shrink-1 basis-200 flex-col text-slate-7 [&>*:not([data-section])]:ml-6">
        <div class="mb-6">
          <prose.h1 id="overview">{props.frontmatter.title}</prose.h1>
        </div>
        <MDXProvider components={prose}>{props.children}</MDXProvider>
      </article>
      <CodePanel />
    </div>
  );
}
