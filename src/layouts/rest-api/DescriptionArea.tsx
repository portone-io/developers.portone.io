import {
  createEffect,
  createMemo,
  createSignal,
  type JSXElement,
  mergeProps,
  onCleanup,
  Show,
} from "solid-js";

export interface DescriptionAreaProps {
  maxHeightPx?: number;
  bgColor?: string;
  children: JSXElement;
}
export default function DescriptionArea(_props: DescriptionAreaProps) {
  const props = mergeProps(
    {
      maxHeightPx: 16 * 12, // 12rem
      bgColor: "white",
    },
    _props,
  );
  let childrenContainerRef: HTMLDivElement | undefined;
  const [maxHeightIsSmall, setMaxHeightIsSmall] = createSignal(false);
  const [open, setOpen] = createSignal(false);
  const maxHeight = createMemo(() =>
    open() ? "" : `${props.maxHeightPx / 16}rem`,
  );
  createEffect(() => {
    const maxHeightPx = props.maxHeightPx;
    function checkMaxHeightIsSmall() {
      const rect = childrenContainerRef?.getBoundingClientRect();
      const maxHeightIsSmall = (rect?.height || 0) > maxHeightPx;
      setMaxHeightIsSmall(maxHeightIsSmall);
    }
    checkMaxHeightIsSmall();
    addEventListener("resize", checkMaxHeightIsSmall);
    onCleanup(() => removeEventListener("resize", checkMaxHeightIsSmall));
  });
  return (
    <div class="relative overflow-hidden" style={{ "max-height": maxHeight() }}>
      <div class="flex flex-col gap-2" ref={childrenContainerRef}>
        {props.children}
      </div>
      <Show when={maxHeightIsSmall() && !open()}>
        <div
          class="pointer-events-none absolute left-0 top-0 h-full w-full"
          style={{
            background: `linear-gradient(to bottom, transparent 50%, ${props.bgColor})`,
          }}
        />
        <button
          class="absolute bottom-0 h-2rem w-full flex items-center justify-center text-sm font-bold"
          onClick={() => setOpen(true)}
        >
          <div class="overflow-hidden rounded-full px-4 py-2 backdrop-blur-sm">
            자세히...
          </div>
        </button>
      </Show>
    </div>
  );
}
