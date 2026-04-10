import clsx from "clsx";
import type { ParentProps } from "solid-js";

export function ParameterType(props: { class?: string } & ParentProps) {
  return (
    <span class={clsx("text-green-5 font-mono whitespace-normal", props.class)}>
      {props.children}
    </span>
  );
}
