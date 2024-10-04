import {
  cache,
  createAsync,
  type RouteDefinition,
  useLocation,
} from "@solidjs/router";
import { createMemo, createResource, type JSXElement, Show } from "solid-js";

import { NotFoundError } from "~/components/404";
import Metadata from "~/components/Metadata";
import * as prose from "~/components/prose";
import type { DocsEntry } from "~/content/config";
import DocsNavMenu from "~/layouts/sidebar/DocsNavMenu";
import RightSidebar from "~/layouts/sidebar/RightSidebar";
import { SearchProvider, SearchScreen } from "~/layouts/sidebar/search";
import { loadDoc, parseDocsFullSlug, type DocsContentName } from "~/misc/docs";
import { calcNavMenuSystemVersions } from "~/state/nav";
import { Lang } from "~/type";

const loadNavMenuSystemVersions = cache(async (contentName: DocsContentName, lang: Lang) => {
  "use server";

  const { navMenu } = await import("~/state/server-only/nav");
  return calcNavMenuSystemVersions(navMenu[contentName][lang] || []);
}, "docs/nav-menu-system-versions");

export const route = {
  preload: ({ location }) => {
    const parsedFullSlug = parseDocsFullSlug(location.pathname);
    if (!parsedFullSlug) return;
    const [contentName, fullSlug] = parsedFullSlug;
    const lang = fullSlug.split("/")[0] ?? "ko";

    void loadDoc(contentName, fullSlug);
    void loadNavMenuSystemVersions(contentName, lang as Lang);
  },
} satisfies RouteDefinition;

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
    const lang = parts[0] as Lang;
    const slug = parts.slice(1).join("/");
    return { lang, slug };
  });
  const doc = createAsync(() => loadDoc(contentName(), fullSlug()), {
    deferStream: true,
  });
  const frontmatter = createMemo(() => doc()?.frontmatter as DocsEntry);
  const [navMenuSystemVersions] = createResource(params, ({ lang }) =>
    loadNavMenuSystemVersions(contentName(), lang),
  );

  return (
    <SearchProvider>
      <div class="mx-auto max-w-350 flex gap-5">
        <DocsNavMenu nav={contentName()} lang={params().lang} slug={params().slug} />
        <div class="min-w-0 flex flex-1 justify-center gap-5">
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
      <Show when={navMenuSystemVersions.latest}>
        {(versions) => (
          <SearchScreen
            lang={params().lang}
            navMenuSystemVersions={versions()}
          />
        )}
      </Show>
    </SearchProvider>
  );
}
