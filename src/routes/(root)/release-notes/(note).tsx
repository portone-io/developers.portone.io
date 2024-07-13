import { Title } from "@solidjs/meta";
import {
  cache,
  createAsync,
  type RouteDefinition,
  useParams,
} from "@solidjs/router";
import { format } from "date-fns";
import { createMemo, type JSXElement, Show } from "solid-js";
import { match } from "ts-pattern";

import { NotFoundError } from "~/components/404";
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
  preload: ({ params }) => {
    if (!params.slug) return;
    void loadNote(params.slug);
  },
} satisfies RouteDefinition;

export default function NoteLayout(props: { children: JSXElement }) {
  const params = useParams<{ slug: string }>();
  const note = createAsync(() => loadNote(params.slug), { deferStream: true });

  const type = createMemo(() =>
    match(params.slug)
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
      apiSdkNotes: "API / SDK",
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
          <Title>{title()}</Title>
          <prose.h1>{title()}</prose.h1>
          <p class="my-4 text-xl text-gray">
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
