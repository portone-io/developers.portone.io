import clsx from "clsx";
import { createSignal, type JSXElement } from "solid-js";

import { getLinkStyle, LinkTitle } from "../sidebar/LeftSidebarItem";

interface FolderProps {
  title: string;
  path: string;
  activeSlug: string | undefined;
  children: JSXElement;
}

function NoteFolder(props: FolderProps) {
  const [open, setOpen] = createSignal(
    props.activeSlug?.startsWith(props.path),
  );
  return (
    <div>
      <button
        class={clsx("flex w-full pr-0", getLinkStyle(false))}
        onClick={() => setOpen((prev) => !prev)}
      >
        <div class="grow">
          <LinkTitle title={props.title} />
        </div>
        <div class="h-full flex items-center p-2">
          <i
            class="inline-block"
            classList={{
              "i-ic-baseline-keyboard-arrow-down": open(),
              "i-ic-baseline-keyboard-arrow-right": !open(),
            }}
          />
        </div>
      </button>
      <div class="pl-2" classList={{ hidden: !open() }}>
        <ul class="flex flex-col gap-1 border-l pl-2">{props.children}</ul>
      </div>
    </div>
  );
}

export default NoteFolder;
