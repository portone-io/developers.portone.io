import clsx from "clsx";
import type { ParentProps } from "solid-js";

export function ParameterType(props: { class?: string } & ParentProps) {
  return (
    <span class={clsx("font-mono whitespace-normal text-green-5", props.class)}>
      {props.children}
    </span>
  );
}
