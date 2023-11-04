import * as prose from "~/components/prose";
import RestApi from "~/layouts/rest-api";
import SchemaDownloadButton, {
  PostmanGuide,
} from "~/layouts/rest-api/misc/SchemaDownloadButton";
import schema from "~/schema/v2.openapi.json";

export interface RestV2Props {
  currentSection: string;
}
export default function RestV2({ currentSection }: RestV2Props) {
  return (
    <RestApi
      title="PortOne REST API - V2"
      basepath="/api/rest-v2"
      apiHost="https://api.portone.io"
      currentSection={currentSection}
      schema={schema}
    >
      <prose.p>
        결제완료된 정보, 결제취소, 상태별 결제목록 조회 등의 기능을 하는 REST
        API를 제공합니다.
      </prose.p>
      <prose.p>
        <strong>V2 API hostname: </strong>
        <code>api.portone.io</code>
      </prose.p>
      <prose.p>
        <SchemaDownloadButton
          label="OpenAPI JSON 내려받기"
          href="https://raw.githubusercontent.com/portone-io/developers.portone.io/main/src/schema/v2.openapi.json"
        >
          <PostmanGuide href="https://learning.postman.com/docs/integrations/available-integrations/working-with-openAPI/" />
        </SchemaDownloadButton>
      </prose.p>
    </RestApi>
  );
}
