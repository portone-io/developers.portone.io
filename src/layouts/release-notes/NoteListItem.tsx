import { format } from "date-fns";
import { createMemo } from "solid-js";

import { JustLink } from "~/layouts/sidebar/LeftSidebarItem";
import type { ReleaseNote } from "~/misc/releaseNote";

interface Props {
  note: ReleaseNote;
  activeSlug: string | undefined;
}

export default function NoteListItem(props: Props) {
  const noteTitle = createMemo(
    () => `${format(props.note.entry.releasedAt, "yyyy-MM-dd")} 업데이트`,
  );
  const isActive = createMemo(() =>
    props.activeSlug ? props.note.slug === props.activeSlug : false,
  );
  const href = createMemo(() => `/release-notes/${props.note.slug}`);

  return (
    <li>
      <JustLink
        title={noteTitle()}
        href={href()}
        isActive={isActive()}
        event={{
          name: "Developers_Releasenote_Menu_Click",
          props: { slug: props.note.slug },
        }}
      />
    </li>
  );
}
