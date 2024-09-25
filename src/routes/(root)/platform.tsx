import { createAsync, type RouteDefinition } from "@solidjs/router";
import { type JSXElement, Show, Suspense } from "solid-js";

import Nav from "~/layouts/platform/Nav";
import { loadPlatformDocuments } from "~/misc/platform";

export const route = {
  preload: () => {
    void loadPlatformDocuments();
  },
} satisfies RouteDefinition;

export default function PlatformLayout(props: { children: JSXElement }) {
  const docs = createAsync(() => loadPlatformDocuments());

  return (
    <div class="flex">
      <aside
        id="left-sidebar"
        class="relative hidden w-65 shrink-0 text-slate-7 md:block"
      >
        <div class="fixed h-[calc(100%-3.5rem)] w-inherit overflow-y-scroll border-r bg-white">
          <Suspense>
            <Show when={docs()}>
              {(docs) => <Nav guides={docs().guides} usages={docs().usages} />}
            </Show>
          </Suspense>
        </div>
      </aside>
      <div class="min-w-0 flex flex-1 justify-center">{props.children}</div>
    </div>
  );
}
