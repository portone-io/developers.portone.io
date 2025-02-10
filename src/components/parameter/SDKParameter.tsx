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
  const component = createMemo(() => {
    if (props.mode === undefined || props.mode === "full") {
      return browserSdk[props.path].typeDef;
    }
    if (props.mode === "details-only") {
      return browserSdk[props.path].details;
    }
    return browserSdk[props.path].type;
  });

  return (
    <Dynamic
      component={component()}
      ident={props.ident}
      optional={props.optional}
    />
  );
}
