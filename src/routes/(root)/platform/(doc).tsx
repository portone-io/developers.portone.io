import {
  cache,
  createAsync,
  type RouteDefinition,
  useLocation,
} from "@solidjs/router";
import { createMemo, type JSXElement, Show } from "solid-js";

import { NotFoundError } from "~/components/404";
import Metadata from "~/components/Metadata";
import * as prose from "~/components/prose";
import RightSidebar from "~/layouts/sidebar/RightSidebar";

const getSlug = (path: string) => path.replace(/^\/platform\//, "");

const loadDoc = cache(async (slug: string) => {
  "use server";

  const { platform } = await import("#content");
  if (!(slug in platform)) throw new NotFoundError();
  return platform[slug as keyof typeof platform];
}, "platform/document");

export const route = {
  preload: ({ location }) => {
    const slug = getSlug(location.pathname);
    if (slug) void loadDoc(slug);
  },
} satisfies RouteDefinition;

export default function PlatformDocLayout(props: { children: JSXElement }) {
  const location = useLocation();
  const slug = createMemo(() => getSlug(location.pathname));
  const doc = createAsync(() => loadDoc(slug()), { deferStream: true });

  return (
    <Show when={doc()}>
      {(doc) => {
        const { title } = doc().frontmatter;

        return (
          <>
            <Metadata title={title} ogType="article" />
            <article class="m-4 mb-40 min-w-0 flex shrink-1 basis-200 flex-col text-slate-700">
              <prose.h1>{title}</prose.h1>
              {props.children}
            </article>
            <div class="hidden shrink-10 basis-10 lg:block"></div>
            <RightSidebar
              lang="ko"
              slug={doc()?.slug ?? ""}
              editThisPagePrefix="https://github.com/portone-io/developers.portone.io/blob/main/src/content/platform/"
            />
          </>
        );
      }}
    </Show>
  );
}
