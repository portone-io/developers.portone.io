import RestApi, { Hr } from "~/layouts/rest-api";
import schema from "~/schema/v2.openapi.json";
import { Categories } from "~/layouts/rest-api/category";
import { TypeDefinitions } from "~/layouts/rest-api/type-def";

export interface RestV2Props {
  currentSection: string;
}
export default function RestV2({ currentSection }: RestV2Props) {
  return (
    <RestApi title="PortOne REST API - V2">
      <Hr />
      <Categories
        basepath="/api/rest-v2"
        currentSection={currentSection}
        schema={schema}
      />
      <Hr />
      <TypeDefinitions
        basepath="/api/rest-v2"
        schema={schema}
        initialExpand={currentSection === "type-def"}
      />
    </RestApi>
  );
}
