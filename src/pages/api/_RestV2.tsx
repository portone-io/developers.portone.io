import RestApi, { Hr } from "~/layouts/rest-api";
import schema from "../../schema/v2.openapi.json";
import { TypeDefinitions } from "~/layouts/rest-api/type-def";

export default function RestV2() {
  return (
    <RestApi title="PortOne REST API - V2">
      <p class="mt-4">TODO</p>
      <Hr />
      <TypeDefinitions schema={schema} />
    </RestApi>
  );
}
