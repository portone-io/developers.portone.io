import {
  cache,
  createAsync,
  type RouteDefinition,
  useLocation,
} from "@solidjs/router";
import { format } from "date-fns";
import { createMemo, type JSXElement, Show } from "solid-js";
import { match } from "ts-pattern";

import { NotFoundError } from "~/components/404";
import Metadata from "~/components/Metadata";
import * as prose from "~/components/prose";
import Banner from "~/components/release-note/Banner";
import Footer from "~/components/release-note/Footer";

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

  const type = createMemo(() =>
    match(slug())
      .when(
        (v) => v.startsWith("api-sdk"),
        () => "apiSdkNotes" as const,
      )
      .when(
        (v) => v.startsWith("console"),
        () => "consoleNotes" as const,
      )
      .when(
        (v) => v.startsWith("platform"),
        () => "platformNotes" as const,
      )
      .run(),
  );
  const label = createMemo(() => {
    return {
      apiSdkNotes: "원 페이먼트 인프라",
      consoleNotes: "관리자콘솔",
      platformNotes: "파트너 정산 자동화",
    }[type()];
  });
  const title = createMemo(
    () =>
      note() &&
      `${format(note()!.frontmatter.releasedAt, "yyyy-MM-dd")} ${label()} 업데이트`,
  );

  return (
    <Show when={note()}>
      {(note) => (
        <>
          <Metadata title={title()!} ogType="article" />
          <prose.h1>{title()}</prose.h1>
          <p class="my-4 text-[18px] text-gray font-400 leading-[28.8px]">
            {format(note().frontmatter.releasedAt, "yyyy년 M월 d일")} {label()}{" "}
            업데이트 소식을 안내드립니다.
          </p>
          <Banner />
          {props.children}
          <Footer
            date={format(note().frontmatter.writtenAt, "yyyy년 M월 d일")}
          />
        </>
      )}
    </Show>
  );
}
