import type { ReleaseNote } from "~/misc/releaseNote";

import NoteList from "./NoteList";

interface Props {
  consoleNotes: ReleaseNote[];
  apiSdkNotes: ReleaseNote[];
  platformNotes: ReleaseNote[];
  activeSlug?: string;
}

export default function Nav(props: Props) {
  return (
    <nav>
      <ul class="flex flex-col gap-1 p-2 py-4">
        <NoteList
          notes={props.consoleNotes}
          title="관리자콘솔"
          activeSlug={props.activeSlug}
        />
        <NoteList
          notes={props.apiSdkNotes}
          title="API / SDK"
          activeSlug={props.activeSlug}
        />
        <NoteList
          notes={props.platformNotes}
          title="파트너 정산 자동화"
          activeSlug={props.activeSlug}
        />
      </ul>
    </nav>
  );
}
