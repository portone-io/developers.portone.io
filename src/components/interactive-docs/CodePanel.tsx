import { createSignal } from "solid-js";

import { CodePanelResizer } from "./CodePanelResizer";
import { CodePreview } from "./CodePreview";
import { CodeRenderer } from "./CodeRenderer";

export function CodePanel() {
  let ref: HTMLElement;
  const [topHeightPercent, setTopHeightPercent] = createSignal(50); // 초기값은 50%

  return (
    <nav
      ref={ref!}
      class="sticky top-38 grid mb-2 h-[calc(100dvh-144px-16px)] rounded-xl bg-slate-7"
      style={{
        "grid-template-rows": `${topHeightPercent()}% 8px ${
          100 - topHeightPercent()
        }%`,
      }}
    >
      <CodeRenderer />
      <CodePanelResizer
        topHeightPercent={topHeightPercent()}
        onChange={setTopHeightPercent}
        containerRef={ref!}
      />
      <CodePreview />
    </nav>
  );
}
