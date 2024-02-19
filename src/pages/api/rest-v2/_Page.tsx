import * as prose from "~/components/prose";
import RestApi from "~/layouts/rest-api";
import useSectionDescriptionProps from "~/layouts/rest-api/misc/useSectionDescriptionProps";
import SchemaDownloadButton, {
  PostmanGuide,
} from "~/layouts/rest-api/misc/SchemaDownloadButton";
import schema from "~/schema/v2.openapi.json";

export interface RestV2Props {
  currentSection: string;
}
export default function RestV2(props: RestV2Props) {
  const { currentSection } = props;
  const sectionDescriptionProps = useSectionDescriptionProps(props);
  return (
    <RestApi
      title="PortOne REST API - V2"
      basepath="/api/rest-v2"
      apiHost="https://api.portone.io"
      currentSection={currentSection}
      sectionDescriptionProps={sectionDescriptionProps}
      schema={schema}
    >
      <prose.p>
        API 결제, 결제 정보 조회, 결제 취소 등의 기능을 제공하는 REST API입니다. V2 API Secret을 발급받은 뒤 사용하실 수 있습니다.
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
      <prose.h3>
        연동 안내
      </prose.h3>
      <prose.p>
        요청과 응답의 본문은 JSON 형식입니다.<br/>API 응답에 포함된 필드는 별도 안내 없이 추가될 수 있으니, 알지 못하는 필드가 있는 경우에는 무시하도록 개발해 주세요.
      </prose.p>
    </RestApi>
  );
}
