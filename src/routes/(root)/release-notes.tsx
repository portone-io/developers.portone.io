import { createAsync, type RouteDefinition } from "@solidjs/router";
import { type JSXElement, Show } from "solid-js";

import Nav from "~/layouts/release-notes/Nav";
import { getReleaseNotes } from "~/misc/releaseNote";

interface Props {
  children: JSXElement;
}

export const route = {
  preload: () => {
    void getReleaseNotes();
  },
} satisfies RouteDefinition;

export default function ReleaseNotesLayout(props: Props) {
  const notes = createAsync(() => getReleaseNotes());

  return (
    <div class="flex">
      <aside
        id="left-sidebar"
        class="relative hidden w-65 shrink-0 text-slate-7 md:block"
      >
        <div class="fixed h-[calc(100%-6.5rem)] w-inherit overflow-y-scroll border-r bg-white">
          <Show when={notes()}>
            {(notes) => (
              <Nav
                consoleNotes={notes().consoleNotes}
                apiSdkNotes={notes().apiSdkNotes}
                platformNotes={notes().platformNotes}
              />
            )}
          </Show>
        </div>
      </aside>
      <div class="mx-auto shrink basis-200">
        <article class="m-4 flex flex-col text-slate-7">
          {props.children}
        </article>
      </div>
    </div>
  );
}
