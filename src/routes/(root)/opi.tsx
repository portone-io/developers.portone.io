import { createAsync, useLocation } from "@solidjs/router";
import { createMemo, type JSXElement, Show } from "solid-js";

import { NotFoundError } from "~/components/404";
import Metadata from "~/components/Metadata";
import * as prose from "~/components/prose";
import type { DocsEntry } from "~/content/config";
import DocsNavMenu from "~/layouts/sidebar/DocsNavMenu";
import RightSidebar from "~/layouts/sidebar/RightSidebar";
import { getOpiFullSlug, loadDoc } from "~/misc/opi";
import { Lang } from "~/type";

export default function Docs(props: { children: JSXElement }) {
  const location = useLocation();
  const fullSlug = createMemo(() => {
    const slug = getOpiFullSlug(location.pathname);
    if (!slug) throw new NotFoundError();
    return slug;
  });
  const params = createMemo(() => {
    const parts = fullSlug().split("/");
    const lang = parts[0] as Lang;
    const slug = parts.slice(1).join("/");
    return { lang, slug };
  });
  const doc = createAsync(() => loadDoc(fullSlug()), {
    deferStream: true,
  });
  const frontmatter = createMemo(() => doc()?.frontmatter as DocsEntry);

  return (
    <div class="flex gap-5">
      <DocsNavMenu lang={params().lang} slug={params().slug} />
      <div class="min-w-0 flex flex-1 justify-center gap-5">
        <Show when={frontmatter()}>
          {(frontmatter) => (
            <>
              <Metadata
                title={frontmatter().title}
                description={frontmatter().description}
                ogType="article"
                ogImageSlug={`opi/${params().lang}/${params().slug}.png`}
                docsEntry={frontmatter()}
              />
              <article class="m-4 mb-40 min-w-0 flex shrink-1 basis-200 flex-col text-slate-7">
                <div class="mb-6">
                  <prose.h1 id="overview">{frontmatter().title}</prose.h1>
                  <Show when={frontmatter().description}>
                    <p class="my-4 text-[18px] text-gray font-400 leading-[28.8px]">
                      {frontmatter().description}
                    </p>
                  </Show>
                </div>
                {props.children}
              </article>
            </>
          )}
        </Show>
        <RightSidebar
          lang={params().lang}
          file={doc()?.file ?? ""}
          headings={doc()?.headings ?? []}
        />
      </div>
    </div>
  );
}
