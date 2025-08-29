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

  return (
    <div
      class={`gap-${props.gap} relative grid ${props.bp}:${
        smallRight() ? "grid-cols-[3fr_2fr]" : "grid-cols-2"
      }  ${props.class}`}
    >
      <div class={props.leftClass}>{props.left()}</div>
      <div
        class={
          props.stickyRight
            ? `${props.bp}:sticky top-20 h-max ${props.rightClass}`
            : props.rightClass
        }
      >
        {props.right()}
      </div>
    </div>
  );
}

// Ensure tailwind compilation
// eslint-disable-next-line @typescript-eslint/no-unused-expressions
("gap-2 gap-4 gap-6 md:grid-cols-2 md:grid-cols-[3fr_2fr] lg:grid-cols-2 lg:grid-cols-[3fr_2fr]");
