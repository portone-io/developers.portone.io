import { Collapsible } from "@kobalte/core/collapsible";
import { type JSXElement, type ParentProps } from "solid-js";

interface ParameterProps {
  children?: JSXElement;
}

export default function Parameter(props: ParameterProps) {
  return (
    <div class="ml-1 b-l b-l-[#ddd] pl-4.5 text-sm text-slate-5 space-y-2">
      {props.children}
    </div>
  );
}

interface TypeDefProps {
  ident?: JSXElement;
  optional?: boolean;
  type: JSXElement;
  children?: JSXElement;
}

Parameter.TypeDef = function TypeDef(props: TypeDefProps) {
  return (
    <Collapsible defaultOpen as="div" class="text-sm">
      <div class="h-0 w-0">
        <button class="h-4 w-4 bg-white p-.5 -ml-7">
          <i class="i-ic-sharp-chevron-right inline-block h-4 w-4 transform-rotate-90"></i>
        </button>
      </div>
      <Collapsible.Trigger as="div" class="cursor-default text-slate-7">
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
      </Collapsible.Trigger>
      <div class="text-slate-5">{props.children}</div>
    </Collapsible>
  );
};

Parameter.Object = function Object(props: ParentProps) {
  return (
    <Collapsible.Content as={Parameter}>{props.children}</Collapsible.Content>
  );
};
