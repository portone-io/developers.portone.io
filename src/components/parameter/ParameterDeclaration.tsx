import clsx from "clsx";
import { type JSXElement, type ParentProps, Show } from "solid-js";

import { ParameterIdent } from "./ParameterIdent";
import { ParameterType } from "./ParameterType";

type ParameterDeclarationProps = {
  class?: string;
  ident?: JSXElement;
  type?: JSXElement;
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
      <Show when={props.type}>
        <ParameterType>{props.type}</ParameterType>
      </Show>
    </span>
  );
}
