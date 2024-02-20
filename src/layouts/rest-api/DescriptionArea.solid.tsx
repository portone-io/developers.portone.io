/* @jsxImportSource solid-js */

import {
  mergeProps,
  type JSX,
  createSignal,
  createMemo,
  createEffect,
  Show,
} from "solid-js";
import { createElementSize } from "@solid-primitives/resize-observer";

export interface DescriptionAreaProps {
  maxHeightPx?: number;
  bgColor?: string;
  children: JSX.Element;
}
export default function DescriptionArea(_props: DescriptionAreaProps) {
  const props = mergeProps(_props, {
    maxHeightPx: 16 * 12,
    bgColor: "white",
  });

  const [childrenContainer, setChildrenContainer] =
    createSignal<HTMLDivElement | null>(null);
  const [maxHeightIsSmall, setMaxHeightIsSmall] = createSignal(false);
  const [isOpen, setIsOpen] = createSignal(false);
  const maxHeight = createMemo(() =>
    isOpen() ? "" : `${props.maxHeightPx / 16}rem`,
  );

  const containerSize = createElementSize(childrenContainer);
  createEffect(() => {
    const maxHeightIsSmall = (containerSize?.height || 0) > props.maxHeightPx;
    setMaxHeightIsSmall(maxHeightIsSmall);
  });

  return (
    <div class="relative overflow-hidden" style={{ "max-height": maxHeight() }}>
      <div class="flex flex-col gap-2" ref={setChildrenContainer}>
        {props.children}
      </div>
      <Show when={maxHeightIsSmall() && !isOpen()}>
        <div
          class="pointer-events-none absolute left-0 top-0 h-full w-full"
          style={{
            background: `linear-gradient(to bottom, transparent 50%, ${props.bgColor})`,
          }}
        />
        <button
          type="button"
          class="h-2rem absolute bottom-0 flex w-full items-center justify-center text-sm font-bold"
          onClick={() => setIsOpen(true)}
        >
          <div class="overflow-hidden rounded-full px-4 py-2 backdrop-blur-sm">
            자세히...
          </div>
        </button>
      </Show>
    </div>
  );
}
