import { For } from "solid-js";

import type { Document } from "~/misc/platform";

import NoteListItem from "./DocumentListItem";

interface Props {
  title: string;
  documents: Document[];
  activeSlug: string | undefined;
}

export default function DocumentList(props: Props) {
  return (
    <li>
      <h4 class="p-2 text-lg font-bold first:mt-0">{props.title}</h4>
      <ul class="flex flex-col gap-1">
        <For each={props.documents}>
          {(document) => (
            <NoteListItem document={document} activeSlug={props.activeSlug} />
          )}
        </For>
      </ul>
    </li>
  );
}
