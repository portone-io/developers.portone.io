import clsx from "clsx";
import type { ParentProps } from "solid-js";

export function ParameterType(props: { class?: string } & ParentProps) {
  return (
    <span class={clsx("whitespace-normal text-green-5 font-mono", props.class)}>
      {props.children}
    </span>
  );
}
