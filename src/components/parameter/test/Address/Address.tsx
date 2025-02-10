import Parameter from "~/components/parameter/Parameter";
import { ParameterHover } from "~/components/parameter/ParameterHover";
import { ParameterType } from "~/components/parameter/ParameterType";
import { SDKParameter } from "~/components/parameter/SDKParameter";

import AddressAddressLine1Description from "./Address.addressLine1.description.mdx";
import AddressDescription from "./Address.description.mdx";

interface TypeDefProps {
  ident?: string;
  optional?: boolean;
}

export function TypeDef(props: TypeDefProps) {
  return (
    <Parameter.TypeDef type={<Type {...props} />} {...props}>
      <AddressDescription />
      <Parameter.Details>
        <SDKParameter
          path="#/resources/entity/Country"
          ident="country"
          optional
        />
        <Parameter.TypeDef ident="addressLine1" type="string">
          <AddressAddressLine1Description />
        </Parameter.TypeDef>
      </Parameter.Details>
    </Parameter.TypeDef>
  );
}

export function Type(props: TypeDefProps) {
  return (
    <ParameterHover content={<TypeDef {...props} />}>
      <ParameterType>
        <span class="text-purple-5">Address</span>
      </ParameterType>
    </ParameterHover>
  );
}
