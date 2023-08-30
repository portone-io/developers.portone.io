import RestApi, { Hr } from "~/layouts/rest-api";
import schema from "../../schema/v2.openapi.json";
import { TypeDefinitions } from "~/layouts/rest-api/type-def";
import { getEveryEndpoints } from "~/layouts/rest-api/schema-utils/endpoint";
import EndpointDoc from "~/layouts/rest-api/EndpointDoc";

const endpoints = getEveryEndpoints(schema);

export default function RestV2() {
  return (
    <RestApi title="PortOne REST API - V2">
      <Hr />
      {endpoints.map((endpoint) => (
        <EndpointDoc schema={schema} endpoint={endpoint} />
      ))}
      <Hr />
      <TypeDefinitions schema={schema} />
    </RestApi>
  );
}
