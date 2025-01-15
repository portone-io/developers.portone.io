import type { JSXElement } from "solid-js";

interface ParameterProps {
  ident: string;
  type: string;
  optional: boolean;
  children: JSXElement;
}

export default function Parameter(props: ParameterProps) {
  return (
    <div class="text-xs">
      <div class="text-slate-7">
        <span class="whitespace-normal font-medium font-mono">
          {props.ident}
        </span>
        <span class="font-mono">
          {props.optional ? "?" : ""}
          {": "}
        </span>
        <span class="whitespace-normal text-green-5 font-mono">
          {props.type}
        </span>
      </div>
      <div class="text-slate-5">{props.children}</div>
    </div>
  );
}
