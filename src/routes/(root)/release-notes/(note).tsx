import {
  cache,
  createAsync,
  type RouteDefinition,
  useLocation,
} from "@solidjs/router";
import { format } from "date-fns";
import type { Article, WithContext } from "schema-dts";
import { createMemo, type JSXElement, Show } from "solid-js";

import { NotFoundError } from "~/components/404";
import JsonLd, { organizationJsonLd } from "~/components/JsonLd";
import Metadata from "~/components/Metadata";
import { prose } from "~/components/prose";
import Banner from "~/components/release-note/Banner";
import Footer from "~/components/release-note/Footer";
import {
  getReleaseNoteDescription,
  getReleaseNoteTitle,
} from "~/misc/releaseNote";

const loadNote = cache(async (slug: string) => {
  "use server";
  const { releaseNotes } = await import("#content");
  if (!(slug in releaseNotes)) throw new NotFoundError();
  return releaseNotes[slug as keyof typeof releaseNotes];
}, "release-notes/note");

export const route = {
  preload: ({ location }) => {
    const slug = getSlug(location.pathname);
    if (slug) void loadNote(slug);
  },
} satisfies RouteDefinition;

const getSlug = (path: string) => path.replace(/^\/release-notes\//, "");

export default function NoteLayout(props: { children: JSXElement }) {
  const location = useLocation();
  const slug = createMemo(() => getSlug(location.pathname));
  const note = createAsync(() => loadNote(slug()), { deferStream: true });

  return (
    <Show when={note()}>
      {(note) => {
        const title = createMemo(() =>
          getReleaseNoteTitle(note().frontmatter.releasedAt, slug()),
        );
        const description = createMemo(() =>
          getReleaseNoteDescription(note().frontmatter.releasedAt, slug()),
        );
        const articleJsonLd = createMemo(
          (): WithContext<Article> => ({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: title(),
            description: description(),
            datePublished: note().frontmatter.releasedAt.toISOString(),
            dateModified: note().frontmatter.writtenAt.toISOString(),
            url: `https://developers.portone.io/release-notes/${slug()}`,
            publisher: organizationJsonLd,
          }),
        );
        return (
          <>
            <Metadata title={title()} ogType="article" />
            <JsonLd data={articleJsonLd()} />
            <prose.h1>{title()}</prose.h1>
            <p class="my-4 text-[18px] text-gray font-400 leading-[28.8px]">
              {description()}
            </p>
            <Banner />
            {props.children}
            <Footer
              date={format(note().frontmatter.writtenAt, "yyyy년 M월 d일")}
            />
          </>
        );
      }}
    </Show>
  );
}
