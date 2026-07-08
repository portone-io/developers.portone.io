import { createMemo, type JSXElement, mergeProps } from "solid-js";

export interface TwoColumnLayoutProps {
  class?: string;
  left: () => JSXElement;
  leftClass?: string;
  right: () => JSXElement;
  rightClass?: string;
  smallRight?: boolean;
  stickyRight?: boolean;
  bp?: string;
  gap?: number;
}
export default function TwoColumnLayout(_props: TwoColumnLayoutProps) {
  const props = mergeProps(
    {
      class: "",
      leftClass: "",
      rightClass: "",
      bp: "lg",
      gap: 4,
    },
    _props,
  );
  const smallRight = createMemo(() => props.smallRight ?? !props.right);
  const gapClass = createMemo(() =>
    props.gap === 2 ? "gap-2" : props.gap === 6 ? "gap-6" : "gap-4",
  );
  const breakpointClass = createMemo(() => {
    if (props.bp === "md") {
      return smallRight() ? "md:grid-cols-[3fr_2fr]" : "md:grid-cols-2";
    }
    return smallRight() ? "lg:grid-cols-[3fr_2fr]" : "lg:grid-cols-2";
  });
  const stickyClass = createMemo(() => {
    if (!props.stickyRight) return props.rightClass;
    return props.bp === "md"
      ? `md:sticky top-20 h-max ${props.rightClass}`
      : `lg:sticky top-20 h-max ${props.rightClass}`;
  });

  return (
    <div
      class={`${gapClass()} relative grid ${breakpointClass()} ${props.class}`}
    >
      <div class={props.leftClass}>{props.left()}</div>
      <div class={stickyClass()}>{props.right()}</div>
    </div>
  );
}
