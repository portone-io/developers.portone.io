import { createMemo, For } from "solid-js";
import { match, P } from "ts-pattern";

import type { ReleaseNote } from "~/misc/releaseNote";

import NoteFolder from "./NoteFolder";
import NoteListItem from "./NoteListItem";

interface Props {
  title: string;
  notes: ReleaseNote[];
  activeSlug: string | undefined;
}

export default function NoteList(props: Props) {
  const groupedNotesBeforeYear = new Date().getFullYear();

  const noteData = createMemo(() =>
    props.notes.reduce(
      (acc, note) => {
        const { notes, noteMap } = acc;
        match(new Date(note.entry.releasedAt).getFullYear())
          .with(P.number.gte(groupedNotesBeforeYear), () => {
            notes.push(note);
          })
          .with(P.number, (year) => {
            const [prefix] = note.slug.split("/");
            const path = `${prefix}/${year}`;
            if (!noteMap.has(path)) {
              noteMap.set(path, {
                title: `${year}년 업데이트`,
                notes: [note],
              });
            } else {
              noteMap.get(path)!.notes.push(note);
            }
          })
          .exhaustive();
        return acc;
      },
      {
        notes: [] as ReleaseNote[],
        noteMap: new Map<string, { title: string; notes: ReleaseNote[] }>(),
      },
    ),
  );

  return (
    <li>
      <h4 class="p-2 text-lg font-bold first:mt-0">{props.title}</h4>
      <ul class="flex flex-col gap-1">
        <For each={noteData().notes}>
          {(note) => <NoteListItem note={note} activeSlug={props.activeSlug} />}
        </For>
        <For each={[...noteData().noteMap.entries()]}>
          {([path, { notes, title }]) => (
            <li>
              <NoteFolder
                title={title}
                path={path}
                activeSlug={props.activeSlug}
              >
                <For each={notes}>
                  {(note) => (
                    <NoteListItem note={note} activeSlug={props.activeSlug} />
                  )}
                </For>
              </NoteFolder>
            </li>
          )}
        </For>
      </ul>
    </li>
  );
}
