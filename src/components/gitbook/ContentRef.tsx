import { A, cache, createAsync } from "@solidjs/router";
import { createMemo, Show } from "solid-js";

interface Props {
  slug: string;
}

const getEntryData = cache(async (slug: string) => {
  "use server";

  const { opi } = await import("#content");
  return (opi as Record<string, (typeof opi)[keyof typeof opi]>)[slug]
    ?.frontmatter;
}, "opi/entry");

export default function ContentRef(props: Props) {
  const slug = createMemo(() => props.slug.slice(1));
  const entryData = createAsync(() => getEntryData(slug()));
  const title = createMemo(() => entryData()?.title);

  return (
    <Show when={title()}>
      <A class="m-4" href={`/opi/${slug()}`}>
        <div class="flex items-center justify-between gap-4 border rounded bg-white p-4 transition-transform hover:translate-y-[-2px] hover:text-orange-5 hover:drop-shadow-[0_12px_13px_rgba(0,0,0,0.02)]">
          <span>{title()}</span>
          <i class="i-ic-baseline-chevron-right inline-block text-2xl" />
        </div>
      </A>
    </Show>
  );
}
