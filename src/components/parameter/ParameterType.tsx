import type { ParentProps } from "solid-js";

export function ParameterType(props: ParentProps) {
  return (
    <span class="whitespace-normal text-green-5 font-mono">
      {props.children}
    </span>
  );
}
