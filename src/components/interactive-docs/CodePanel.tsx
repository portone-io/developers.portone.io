import { CodePreview } from "./CodePreview";
import { CodeRenderer } from "./CodeRenderer";

export function CodePanel() {
  let ref: HTMLElement;

  return (
    <nav
      ref={ref!}
      class="sticky top-38 grid grid-rows-[auto_1fr] h-[calc(100dvh-144px-16px)] gap-y-2 overflow-hidden rounded-xl bg-slate-8 px-2"
    >
      <CodePreview />
      <CodeRenderer />
    </nav>
  );
}
