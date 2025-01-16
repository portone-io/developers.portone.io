import clsx from "clsx";
import type { JSXElement } from "solid-js";

import styles from "./ParamTree.module.css";

interface ParamTreeProps {
  children: JSXElement;
}

export default function ParamTree(props: ParamTreeProps) {
  return <div class={clsx(styles.paramTree, "text-sm")}>{props.children}</div>;
}

interface ParameterProps {
  ident: string;
  type: string;
  optional?: boolean;
  children: JSXElement;
}

function Parameter(props: ParameterProps) {
  return (
    <div class="text-sm">
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

ParamTree.Parameter = Parameter;
