import type { ParentProps } from "solid-js";

export function ParameterIdent(props: ParentProps) {
  return (
    <span class="whitespace-normal font-medium font-mono">
      {props.children}
    </span>
  );
}
