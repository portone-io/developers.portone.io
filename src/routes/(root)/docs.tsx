import {
  cache,
  redirect,
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
import { calcNavMenuSystemVersions } from "~/state/nav";
import { Lang } from "~/type";

const toFullSlug = (pathname: string) => pathname.replace(/^\/docs\/?/, "");
const loadRedirection = cache(async (slug: string) => {
  "use server";

  const { default: redirYaml } = await import(
    "~/routes/(root)/docs/_redir.yaml"
  );
  const redir = redirYaml.find(({ old }) => old === slug);
  if (!redir) return;
  return redir.new.startsWith("/") ? `/docs${redir.new}` : redir.new;
}, "docs/redirection");

const loadDoc = cache(async (fullSlug: string) => {
  "use server";

  if (fullSlug === "") throw redirect("/docs/ko/readme", 302);
  if (!fullSlug.includes("/")) throw redirect(`/docs/${fullSlug}/readme`, 302);

  const { docs } = await import("#content");
  const redirection = await loadRedirection(`/${fullSlug}`);
  if (redirection) throw redirect(redirection, 301);
  if (!(fullSlug in docs)) throw new NotFoundError();

  return docs[fullSlug as keyof typeof docs];
}, "docs/content");
const loadNavMenuSystemVersions = cache(async (lang: Lang) => {
  "use server";

  const { navMenu } = await import("~/state/server-only/nav");
  return calcNavMenuSystemVersions(navMenu[lang] || []);
}, "docs/nav-menu-system-versions");

export const route = {
  preload: ({ location }) => {
    const fullSlug = toFullSlug(location.pathname);
    const lang = fullSlug.split("/")[0];

    void loadDoc(fullSlug);
    void loadNavMenuSystemVersions(lang as Lang);
  },
} satisfies RouteDefinition;

export default function Docs(props: { children: JSXElement }) {
  const location = useLocation();
  const fullSlug = createMemo(() => toFullSlug(location.pathname));
  const params = createMemo(() => {
    const [lang, slug] = fullSlug().split("/", 1) as [Lang, string];
    return { lang, slug };
  });
  const [doc] = createResource(fullSlug, (slug) => loadDoc(slug), {
    deferStream: true,
  });
  const [navMenuSystemVersions] = createResource(params, ({ lang }) =>
    loadNavMenuSystemVersions(lang),
  );

  return (
    <SearchProvider>
      <div class="flex">
        <DocsNavMenu lang={params().lang} slug={params().slug} />
        <div class="min-w-0 flex flex-1 justify-center">
          <Show when={doc()}>
            {(doc) => (
              <>
                <Metadata
                  title={doc().frontmatter.title}
                  description={doc().frontmatter.description}
                  ogType="article"
                  ogImageSlug={`docs/${params().lang}/${params().slug}.png`}
                  docsEntry={doc().frontmatter as DocsEntry}
                />
                <article class="m-4 mb-40 min-w-0 flex shrink-1 basis-200 flex-col text-slate-700">
                  <div class="mb-6">
                    <prose.h1 id="overview">{doc().frontmatter.title}</prose.h1>
                    <Show when={doc().frontmatter.description}>
                      <p class="my-4 text-xl text-gray">
                        {doc().frontmatter.description}
                      </p>
                    </Show>
                  </div>
                  {props.children}
                </article>
              </>
            )}
          </Show>
          <div class="hidden shrink-10 basis-10 lg:block"></div>
          <RightSidebar lang={params().lang} slug={params().slug} />
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
