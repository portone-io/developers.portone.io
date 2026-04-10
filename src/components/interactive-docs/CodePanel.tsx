import { CodePreview } from "./CodePreview";
import { CodeRenderer } from "./CodeRenderer";

export function CodePanel() {
  let ref: HTMLElement;

  return (
    <nav
      ref={ref!}
      class="bg-slate-8 z-left-sidebar sticky top-42 grid h-[calc(100dvh-160px-8px)] grid-rows-[auto_1fr] gap-y-2 overflow-hidden rounded-xl px-2 md:top-40"
    >
      <CodePreview />
      <CodeRenderer />
    </nav>
  );
}
