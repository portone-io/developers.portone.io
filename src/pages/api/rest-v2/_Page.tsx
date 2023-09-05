import RestApi, { Hr } from "~/layouts/rest-api";
import schema from "~/schema/v2.openapi.json";
import { TypeDefinitions } from "~/layouts/rest-api/type-def";
import { getEveryEndpoints } from "~/layouts/rest-api/schema-utils/endpoint";
import EndpointDoc from "~/layouts/rest-api/EndpointDoc";

const endpoints = getEveryEndpoints(schema);

export interface RestV2Props {
  group: string;
}
export default function RestV2({ group }: RestV2Props) {
  return (
    <RestApi title="PortOne REST API - V2">
      <Hr />
      <div class="flex flex-col gap-10">
        {endpoints.map((endpoint) => (
          <EndpointDoc
            basepath="/api/rest-v2"
            schema={schema}
            endpoint={endpoint}
          />
        ))}
      </div>
      <Hr />
      <TypeDefinitions
        basepath="/api/rest-v2"
        schema={schema}
        expand={group === "type-def"}
      />
    </RestApi>
  );
}
