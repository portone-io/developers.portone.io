import { createAsync, useLocation } from "@solidjs/router";
import {
  createMemo,
  type JSXElement,
  Match,
  type ParentProps,
  Show,
  Switch,
} from "solid-js";

import { NotFoundError } from "~/components/404";
import Metadata from "~/components/Metadata";
import * as prose from "~/components/prose";
import type { DocsEntry } from "~/content/config";
import DocsNavMenu from "~/layouts/sidebar/DocsNavMenu";
import RightSidebar from "~/layouts/sidebar/RightSidebar";
import { loadDoc, parseDocsFullSlug } from "~/misc/docs";
import { Lang } from "~/type";

import { InteractiveDocs } from "./InteractiveDocs";

export function Docs(props: { children: JSXElement }) {
  const location = useLocation();
  const parsedFullSlug = createMemo(() => {
    const parsedFullSlug = parseDocsFullSlug(location.pathname);
    if (!parsedFullSlug) throw new NotFoundError();
    return parsedFullSlug;
  });
  const fullSlug = createMemo(() => parsedFullSlug()[1]);
  const contentName = createMemo(() => parsedFullSlug()[0]);
  const params = createMemo(() => {
    const parts = fullSlug().split("/");
    const lang = Lang.safeParse(parts[0]).data;
    if (!lang) return null;
    const slug = parts.slice(1).join("/");
    return { lang, slug };
  });
  const doc = createAsync(() => loadDoc(contentName(), fullSlug()), {
    deferStream: true,
  });
  const frontmatter = createMemo(() => doc()?.frontmatter as DocsEntry);

  return (
    <div class="flex">
      <Show when={params()}>
        {(params) => (
          <>
            <DocsNavMenu
              docData={doc()?.frontmatter as DocsEntry}
              nav={contentName()}
              lang={params().lang}
              slug={params().slug}
            />
            <Show when={frontmatter()}>
              {(frontmatter) => (
                <>
                  <Metadata
                    title={frontmatter().title}
                    description={frontmatter().description}
                    ogType="article"
                    ogImageSlug={`${contentName()}/${params().lang}/${params().slug}.png`}
                    docsEntry={frontmatter()}
                  />
                  <Switch
                    fallback={
                      <DefaultLayout
                        frontmatter={frontmatter()}
                        params={params()}
                        doc={doc()}
                      />
                    }
                  >
                    <Match
                      when={frontmatter().customLayout === "InteractiveDocs"}
                    >
                      <InteractiveDocs />
                    </Match>
                  </Switch>
                </>
              )}
            </Show>
          </>
        )}
      </Show>
    </div>
  );
}

const DefaultLayout = (
  props: ParentProps<{
    frontmatter: DocsEntry;
    params: { lang: Lang; slug: string };
    doc: Awaited<ReturnType<typeof loadDoc> | undefined>;
  }>,
) => {
  return (
    <div class="min-w-0 flex flex-1 justify-center gap-5">
      <article class="mb-40 mt-4 min-w-0 flex shrink-1 basis-200 flex-col pl-5 text-slate-7">
        <div class="mb-6">
          <prose.h1 id="overview">{props.frontmatter.title}</prose.h1>
          <Show when={props.frontmatter.description}>
            <p class="my-4 text-[18px] text-gray font-400 leading-[28.8px]">
              {props.frontmatter.description}
            </p>
          </Show>
        </div>
        {props.children}
      </article>
      <RightSidebar
        lang={props.params.lang}
        file={props.doc?.file ?? ""}
        headings={props.doc?.headings ?? []}
      />
    </div>
  );
};
