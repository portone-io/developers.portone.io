import { Dynamic } from "solid-js/web";

import { browserSdk } from "~/components/parameter/__generated__/index.ts";

interface SDKParameterProps {
  path: keyof typeof browserSdk;
  ident?: string;
  optional?: boolean;
  /** default: `full` */
  mode?: "type" | "typeDef" | "details";
}

export function SDKParameter(props: SDKParameterProps) {
  return (
    <Dynamic
      component={browserSdk[props.path][props.mode ?? "typeDef"]}
      ident={props.ident}
      optional={props.optional}
    />
  );
}
