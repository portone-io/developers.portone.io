import Parameter from "~/components/parameter/Parameter";
import { ParameterType } from "~/components/parameter/ParameterType";

import CountryDescription from "./Country.description.mdx";

interface TypeDefProps {
  ident?: string;
  optional?: boolean;
}

export function TypeDef(props: TypeDefProps) {
  return (
    <Parameter.TypeDef
      defaultExpanded={false}
      type={<Type {...props} />}
      {...props}
    >
      <CountryDescription />
      <Parameter.Details>
        <Parameter.TypeDef type='"AF"'>Afganistan</Parameter.TypeDef>
        <Parameter.TypeDef type='"AX"'>Åland Islands</Parameter.TypeDef>
      </Parameter.Details>
    </Parameter.TypeDef>
  );
}

export function Type(props: TypeDefProps) {
  return (
    <span class="space-x-1">
      <ParameterType>"AF"</ParameterType>
      <span class="text-slate-5">|</span>
      <ParameterType>"AX"</ParameterType>
    </span>
  );
}
