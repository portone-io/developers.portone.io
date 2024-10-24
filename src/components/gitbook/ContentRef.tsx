import { A, cache, createAsync } from "@solidjs/router";
import { createMemo, Show } from "solid-js";
import { match } from "ts-pattern";

import { parseDocsFullSlug } from "~/misc/docs";

interface Props {
  slug: string;
}

const getOpiEntryData = async (slug: string) => {
  "use server";

  const { opi } = await import("#content");
  return (opi as Record<string, (typeof opi)[keyof typeof opi]>)[slug]
    ?.frontmatter;
};

const getSdkEntryData = async (slug: string) => {
  "use server";

  const { sdk } = await import("#content");
  return (sdk as Record<string, (typeof sdk)[keyof typeof sdk]>)[slug]
    ?.frontmatter;
};

const getEntryData = cache(async (fullSlug: string) => {
  "use server";

  const parsedFullSlug = parseDocsFullSlug(fullSlug);
  if (!parsedFullSlug) return;
  const [contentName, slug] = parsedFullSlug;

  return match(contentName)
    .with("opi", () => {
      return getOpiEntryData(slug);
    })
    .with("sdk", () => {
      return getSdkEntryData(slug);
    })
    .otherwise(() => {
      return undefined;
    });
}, "docs/entry");

export default function ContentRef(props: Props) {
  const slug = createMemo(() => props.slug);
  const entryData = createAsync(() => getEntryData(slug()));
  const title = createMemo(() => entryData()?.title);

  return (
    <Show when={title()}>
      <A class="m-4" href={slug()}>
        <div class="flex items-center justify-between gap-4 border rounded bg-white p-4 transition-transform hover:translate-y-[-2px] hover:text-orange-5 hover:drop-shadow-[0_12px_13px_rgba(0,0,0,0.02)]">
          <span>{title()}</span>
          <i class="i-ic-baseline-chevron-right inline-block text-2xl" />
        </div>
      </A>
    </Show>
  );
}
