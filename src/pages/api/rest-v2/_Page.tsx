import RestApi from "~/layouts/rest-api";
import schema from "~/schema/v2.openapi.json";

export interface RestV2Props {
  currentSection: string;
}
export default function RestV2({ currentSection }: RestV2Props) {
  return (
    <RestApi
      title="PortOne REST API - V2"
      basepath="/api/rest-v2"
      currentSection={currentSection}
      schema={schema}
    ></RestApi>
  );
}
