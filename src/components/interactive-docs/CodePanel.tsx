import { CodePreview } from "./CodePreview";
import { CodeRenderer } from "./CodeRenderer";

export function CodePanel() {
  let ref: HTMLElement;

  return (
    <nav
      ref={ref!}
      class="sticky top-42 grid grid-rows-[auto_1fr] h-[calc(100dvh-160px-8px)] gap-y-2 overflow-hidden rounded-xl bg-slate-8 px-2 md:top-40"
    >
      <CodePreview />
      <CodeRenderer />
    </nav>
  );
}
