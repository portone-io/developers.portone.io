import type { JSXElement } from "solid-js";

import { useSidebarContext } from "./context";

export default function LeftSidebar(props: { children: JSXElement }) {
  const sidebarOpen = useSidebarContext();

  return (
    <aside class="pointer-events-none absolute left-0 z-left-sidebar w-65 shrink-0 text-slate-7 md:relative md:block">
      <div
        style={{
          transform: sidebarOpen.get() ? "none" : "translateX(-100%)",
        }}
        class="pointer-events-auto fixed flex h-[calc(100dvh-6.5rem)] w-[inherit] flex-col border-r bg-white transition-transform max-md:h-[calc(100dvh-3.5rem)] max-md:pl-6 md:!transform-none"
      >
        {props.children}
      </div>
    </aside>
  );
}
