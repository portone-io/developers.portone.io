import clsx from "clsx";
import { type JSXElement, type ParentProps, Show } from "solid-js";

import { ParameterIdent } from "./ParameterIdent";

type ParameterDeclarationProps = {
  class?: string;
  ident?: JSXElement;
  type: JSXElement;
  optional?: boolean;
} & ParentProps;

export function ParameterDeclaration(props: ParameterDeclarationProps) {
  return (
    <span class={clsx("text-slate-7", props.class)}>
      <Show when={props.ident}>
        <ParameterIdent>{props.ident}</ParameterIdent>
        <span class="font-mono">
          {props.optional === true ? "?" : ""}
          {": "}
        </span>
      </Show>
      {props.type}
    </span>
  );
}
