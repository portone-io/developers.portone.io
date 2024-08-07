import type { JSXElement } from "solid-js";

import { useSidebarContext } from "./context";

export default function LeftSidebar(props: { children: JSXElement }) {
  const sidebarOpen = useSidebarContext();

  return (
    <aside class="pointer-events-none absolute w-65 shrink-0 text-slate-700 z-left-sidebar md:relative md:block">
      <div
        style={{
          transform: sidebarOpen.get() ? "none" : "translateX(-100%)",
        }}
        class="pointer-events-auto fixed h-[calc(100vh-3.5rem)] w-inherit flex flex-col border-r bg-white pl-1 transition-transform md:!transform-none"
      >
        {props.children}
      </div>
    </aside>
  );
}
