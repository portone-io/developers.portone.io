import { untrack } from "solid-js";

interface CodePanelResizerProps {
  topHeightPercent: number;
  onChange: (percent: number) => void;
  containerRef: HTMLDivElement;
}

export function CodePanelResizer(props: CodePanelResizerProps) {
  let resizerRef: HTMLDivElement;
  let startY = 0;
  let startTopHeightPercent = 0;

  function onPointerDown(e: PointerEvent) {
    startY = e.clientY;
    startTopHeightPercent = untrack(() => props.topHeightPercent);

    resizerRef.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: PointerEvent) {
    if (!resizerRef.hasPointerCapture(e.pointerId)) return;

    const dy = e.clientY - startY;
    const containerHeight = untrack(() => props.containerRef.clientHeight);
    const deltaPercent = (dy / containerHeight) * 100;
    let newTopHeightPercent = startTopHeightPercent + deltaPercent;

    newTopHeightPercent = Math.min(Math.max(newTopHeightPercent, 40), 60);
    untrack(() => props.onChange(newTopHeightPercent));
  }

  function onPointerUp(e: PointerEvent) {
    resizerRef.releasePointerCapture(e.pointerId);
  }

  return (
    <div
      ref={resizerRef!}
      class="flex cursor-row-resize items-center justify-center bg-slate-6"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="21"
        height="4"
        viewBox="0 0 21 4"
        fill="none"
      >
        <rect x="0.399902" width="4" height="4" rx="2" fill="#CBD5E1" />
        <rect x="8.3999" width="4" height="4" rx="2" fill="#CBD5E1" />
        <rect x="16.3999" width="4" height="4" rx="2" fill="#CBD5E1" />
      </svg>
    </div>
  );
}
