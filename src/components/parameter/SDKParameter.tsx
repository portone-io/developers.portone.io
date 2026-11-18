import { createMemo } from "solid-js";
import { Dynamic } from "solid-js/web";

import { browserSdk } from "~/components/parameter/__generated__/index.ts";

interface SDKParameterProps {
  path: keyof typeof browserSdk;
  ident?: string;
  optional?: boolean;
  /** default: `full` */
  mode?:
    | "full"
    | "type-only"
    | "ident-only"
    | "ident-and-type"
    | "details-only";
}

export function SDKParameter(props: SDKParameterProps) {
  const option = createMemo(() => {
    if (props.mode === undefined || props.mode === "full") {
      return "typeDef";
    }
    if (props.mode === "details-only") {
      return "details";
    }
    return "type";
  });

  return (
    <Dynamic
      component={browserSdk[props.path][option()]}
      ident={props.ident}
      optional={props.optional}
    />
  );
}
