import { useParams } from "@solidjs/router";
import { format } from "date-fns";
import { createMemo, lazy } from "solid-js";
import { match } from "ts-pattern";

import { releaseNotes } from "#content";
import { NotFoundError } from "~/components/404";
import * as prose from "~/components/prose";
import Banner from "~/components/release-note/Banner";
import Footer from "~/components/release-note/Footer";

export default function ReleaseNote() {
  const params = useParams<{ slug: string }>();
  const note = createMemo(() => {
    if (!(params.slug in releaseNotes)) throw new NotFoundError();
    return releaseNotes[params.slug as keyof typeof releaseNotes];
  });

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
      `${format(note().frontmatter.releasedAt, "yyyy-MM-dd")} ${label()} 업데이트`,
  );
  const content = createMemo(() => {
    const Content = lazy(note().load);
    return <Content />;
  });

  return (
    <>
      <prose.h1>{title()}</prose.h1>
      <p class="my-4 text-xl text-gray">
        {format(note().frontmatter.releasedAt, "yyyy년 M월 d일")} {label()}{" "}
        업데이트 소식을 안내드립니다.
      </p>
      <Banner />
      {content()}
      <Footer date={format(note().frontmatter.writtenAt, "yyyy년 M월 d일")} />
    </>
  );
}
