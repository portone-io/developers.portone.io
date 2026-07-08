import type { ParentProps } from "solid-js";

export function ParameterIdent(props: ParentProps) {
  return (
    <span class="font-mono font-medium whitespace-normal">
      {props.children}
    </span>
  );
}
