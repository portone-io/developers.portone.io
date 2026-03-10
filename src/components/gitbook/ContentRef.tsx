import { A, createAsync, query } from "@solidjs/router";
import { createMemo, Show } from "solid-js";

import { loadDoc, parseDocsFullSlug } from "~/misc/docs";

interface Props {
  slug: string;
}

const getDocsTitle = query(async (fullSlug: string) => {
  "use server";

  const parsedFullSlug = parseDocsFullSlug(fullSlug);
  if (!parsedFullSlug) return;
  const [contentName, slug] = parsedFullSlug;

  const docs = await loadDoc(contentName, slug);
  if (!docs || !("title" in docs.frontmatter)) return;

  return docs.frontmatter.title;
}, "content-ref/title");

export default function ContentRef(props: Props) {
  const slug = createMemo(() => props.slug);
  const title = createAsync(() => getDocsTitle(slug()));

  return (
    <A class="m-4" href={slug()}>
      <div class="flex items-center justify-between gap-4 border rounded bg-white p-4 transition-transform hover:translate-y-[-2px] hover:text-orange-5 hover:drop-shadow-[0_12px_13px_rgba(0,0,0,0.02)]">
        <Show when={title()} fallback={<span>{slug()}</span>}>
          {(title) => <span>{title()}</span>}
        </Show>
        <i class="i-ic-baseline-chevron-right inline-block text-2xl" />
      </div>
    </A>
  );
}
