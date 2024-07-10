import {
  cache,
  createAsync,
  redirect,
  type RouteDefinition,
  useParams,
} from "@solidjs/router";
import { createMemo, lazy, Show, Suspense } from "solid-js";

import { docs } from "#content";
import { NotFoundError } from "~/components/404";
import * as prose from "~/components/prose";
import DocsNavMenu from "~/layouts/sidebar/DocsNavMenu";
import RightSidebar from "~/layouts/sidebar/RightSidebar";
import { SearchProvider, SearchScreen } from "~/layouts/sidebar/search";
import { calcNavMenuSystemVersions } from "~/state/nav";
import { isLang, Lang } from "~/type";

const loadRedirection = cache(async (slug: string) => {
  "use server";

  const { default: redirYaml } = await import("~/content/docs/_redir.yaml");
  const redir = redirYaml.find(({ old }) => old === slug);
  if (!redir) return;
  return redir.new.startsWith("/") ? `/docs${redir.new}` : redir.new;
}, "docs/redirection");

const loadDocsSlug = cache(async (params: Record<string, string>) => {
  const lang = params.lang as Lang;
  const slug = params.slug as string;
  const fullSlug = `${lang}/${slug}`;

  const redirection = await loadRedirection(`/${fullSlug}`);
  if (redirection) throw redirect(redirection, 301);
  if (!(fullSlug in docs)) throw new NotFoundError();

  return fullSlug as keyof typeof docs;
}, "docs/content");

const loadNavMenuSystemVersions = cache(async (lang: Lang) => {
  "use server";

  const { navMenu } = await import("~/state/server-only/nav");
  return calcNavMenuSystemVersions(navMenu[lang] || []);
}, "docs/nav-menu-system-versions");

export const route = {
  matchFilters: {
    lang: isLang,
  },
  preload: ({ params }) => {
    void loadDocsSlug(params);
    void loadNavMenuSystemVersions(params.lang as Lang);
  },
} satisfies RouteDefinition;

export default function Docs() {
  const params = useParams<{
    lang: Lang;
    slug: string;
  }>();
  const docSlug = createAsync(() => loadDocsSlug(params), {
    deferStream: true,
  });
  const doc = createMemo(() => {
    const slug = docSlug();
    if (!slug) return null;
    return docs[slug];
  });
  const content = createMemo(() => {
    const load = doc()?.load;
    if (!load) return null;
    const Content = lazy(load);
    return <Content />;
  });
  const navMenuSystemVersions = createAsync(() =>
    loadNavMenuSystemVersions(params.lang),
  );

  return (
    <SearchProvider>
      <div class="flex">
        <DocsNavMenu lang={params.lang} slug={params.slug} />
        <div class="min-w-0 flex flex-1 justify-center">
          <article class="m-4 mb-40 min-w-0 flex shrink-1 basis-200 flex-col text-slate-700">
            <div class="mb-6">
              <prose.h1 id="overview">{doc()?.frontmatter.title}</prose.h1>
              {doc()?.frontmatter.description && (
                <p class="text-gray">{doc()?.frontmatter.description}</p>
              )}
            </div>
            {content()}
          </article>
          <div class="hidden shrink-10 basis-10 lg:block"></div>
          <RightSidebar lang={params.lang} slug={params.slug} />
        </div>
      </div>
      <Suspense>
        <Show when={navMenuSystemVersions()}>
          {(versions) => (
            <SearchScreen
              lang={params.lang}
              navMenuSystemVersions={versions()}
            />
          )}
        </Show>
      </Suspense>
    </SearchProvider>
  );
}
