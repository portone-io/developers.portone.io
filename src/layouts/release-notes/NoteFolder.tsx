import { useSignal } from "@preact/signals";
import type { PropsWithChildren } from "preact/compat";

import { getLinkStyle, LinkTitle } from "../sidebar/LeftSidebarItem";

interface FolderProps {
  title: string;
  path: string;
  activeSlug: string | undefined;
}

function NoteFolder({
  title,
  path,
  activeSlug,
  children,
}: FolderProps & PropsWithChildren) {
  const openSignal = useSignal(activeSlug?.startsWith(path));
  const open = openSignal.value;
  return (
    <div>
      <button
        class={`flex w-full ${getLinkStyle(false)} pr-0`}
        onClick={() => {
          openSignal.value = !open;
        }}
      >
        <div class="grow">
          <LinkTitle title={title} />
        </div>
        <div class="h-full flex items-center p-2">
          <i
            class={`inline-block ${
              open
                ? "i-ic-baseline-keyboard-arrow-down"
                : "i-ic-baseline-keyboard-arrow-right"
            }`}
          />
        </div>
      </button>
      <div class={`${open ? "block" : "hidden"} pl-2`}>
        <ul class="flex flex-col gap-1 border-l pl-2">{children}</ul>
      </div>
    </div>
  );
}

export default NoteFolder;
