import {
  cache,
  createAsync,
  type RouteDefinition,
  useLocation,
} from "@solidjs/router";
import { format } from "date-fns";
import { createMemo, type JSXElement, Show } from "solid-js";

import { NotFoundError } from "~/components/404";
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
        return (
          <>
            <Metadata title={title()} ogType="article" />
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
