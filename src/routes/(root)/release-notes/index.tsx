import { createAsync, type RouteDefinition } from "@solidjs/router";
import { format } from "date-fns";
import { For, Show } from "solid-js";

import Metadata from "~/components/Metadata";
import * as prose from "~/components/prose";
import Banner from "~/components/release-note/Banner";
import { getReleaseNotes } from "~/misc/releaseNote";

export const route = {
  preload: () => {
    void getReleaseNotes();
  },
} satisfies RouteDefinition;

export default function ReleaseNoteIndex() {
  const notes = createAsync(() => getReleaseNotes());

  return (
    <>
      <Metadata title="포트원 릴리즈노트" />
      <prose.h1>포트원 릴리즈노트</prose.h1>
      <p class="my-4 text-[18px] text-gray font-400 leading-[28.8px]">
        포트원의 업데이트 소식을 전해드립니다.
      </p>
      <Banner />
      <prose.h2>최신 릴리즈노트 보기</prose.h2>
      <div class="flex flex-wrap">
        <Show when={notes()}>
          {(notes) => (
            <For
              each={
                [
                  ["관리자콘솔", notes().consoleNotes],
                  ["API / SDK", notes().apiSdkNotes],
                  ["파트너 정산 자동화", notes().platformNotes],
                ] as const
              }
            >
              {([title, notes]) => (
                <section class="my-4 flex-1 whitespace-nowrap pr-4">
                  <prose.h3>{title}</prose.h3>
                  <ul>
                    <For each={notes.slice(0, 3)}>
                      {(note) => (
                        <li>
                          <prose.a href={`/release-notes/${note.slug}`}>
                            {format(note.entry.releasedAt, "yyyy-MM-dd")}{" "}
                            업데이트
                          </prose.a>
                        </li>
                      )}
                    </For>
                  </ul>
                </section>
              )}
            </For>
          )}
        </Show>
      </div>
    </>
  );
}
