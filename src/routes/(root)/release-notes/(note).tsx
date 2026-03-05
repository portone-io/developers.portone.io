import { useLocation } from "@solidjs/router";
import { format } from "date-fns";
import { createMemo, createResource, type JSXElement, Show } from "solid-js";

import { NotFoundError } from "~/components/404";
import Metadata from "~/components/Metadata";
import { prose } from "~/components/prose";
import Banner from "~/components/release-note/Banner";
import Footer from "~/components/release-note/Footer";
import { loadDoc, parseDocsFullSlug } from "~/misc/docs";
import {
  getReleaseNoteDescription,
  getReleaseNoteTitle,
} from "~/misc/releaseNote";

export default function NoteLayout(props: { children: JSXElement }) {
  const location = useLocation();
  const slug = createMemo(() => {
    const parsedFullSlug = parseDocsFullSlug(location.pathname);
    if (!parsedFullSlug) throw new NotFoundError();
    return parsedFullSlug[1];
  });
  const [note] = createResource(
    () => ["release-notes", slug()] as const,
    async ([contentName, slug]) => {
      const result = await loadDoc(contentName, slug);
      if (!result) throw new NotFoundError();
      return result;
    },
  );

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
