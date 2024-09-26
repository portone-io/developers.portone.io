import { useLocation } from "@solidjs/router";
import { createMemo } from "solid-js";

import type { ReleaseNote } from "~/misc/releaseNote";

import NoteList from "./NoteList";

interface Props {
  consoleNotes: ReleaseNote[];
  apiSdkNotes: ReleaseNote[];
  platformNotes: ReleaseNote[];
}

export default function Nav(props: Props) {
  const location = useLocation();
  const activeSlug = createMemo(() =>
    location.pathname.replace(/^\/release-notes\//, ""),
  );

  return (
    <nav>
      <ul class="flex flex-col gap-1 p-2 py-4">
        <NoteList
          notes={props.consoleNotes}
          title="관리자콘솔"
          activeSlug={activeSlug()}
        />
        <NoteList
          notes={props.apiSdkNotes}
          title="원 페이먼트 인프라"
          activeSlug={activeSlug()}
        />
        <NoteList
          notes={props.platformNotes}
          title="파트너 정산 자동화"
          activeSlug={activeSlug()}
        />
      </ul>
    </nav>
  );
}
