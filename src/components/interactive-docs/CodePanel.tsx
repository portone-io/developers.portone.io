import { createSignal } from "solid-js";

import { CodePanelResizer } from "./CodePanelResizer";
import CodeViewer from "./CodeViewer";
import Preview from "./Preview";

export function CodePanel() {
  let ref: HTMLDivElement;
  const [topHeightPercent, setTopHeightPercent] = createSignal(50); // 초기값은 50%

  return (
    <div
      ref={ref!}
      class="sticky top-38 grid mb-2 h-[calc(100dvh-144px-16px)] rounded-xl bg-[#334155]"
      style={{
        "grid-template-rows": `${topHeightPercent()}% 8px ${
          100 - topHeightPercent()
        }%`,
      }}
    >
      <CodeViewer />
      <CodePanelResizer
        topHeightPercent={topHeightPercent()}
        onChange={setTopHeightPercent}
        containerRef={ref!}
      />
      <Preview />
    </div>
  );
}
