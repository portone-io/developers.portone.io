import type { JSXElement } from "solid-js";

import { useSidebarContext } from "./context";

export default function LeftSidebar(props: { children: JSXElement }) {
  const sidebarOpen = useSidebarContext();

  return (
    <aside class="pointer-events-none absolute left-0 w-70 shrink-0 text-slate-7 z-left-sidebar md:relative md:block">
      <div
        style={{
          transform: sidebarOpen.get() ? "none" : "translateX(-100%)",
        }}
        class="pointer-events-auto fixed h-[calc(100vh-3.5rem)] w-inherit flex flex-col border-r bg-white transition-transform <md:pl-10 md:!transform-none"
      >
        {props.children}
      </div>
    </aside>
  );
}
