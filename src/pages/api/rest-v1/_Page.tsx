import * as prose from "~/components/prose";
import RestApi from "~/layouts/rest-api";
import useSectionDescriptionProps from "~/layouts/rest-api/misc/useSectionDescriptionProps";
import SchemaDownloadButton, {
  PostmanGuide,
} from "~/layouts/rest-api/misc/SchemaDownloadButton";
import schema from "~/schema/v1.openapi.json";

const basepath = "/api/rest-v1";

export interface RestV1Props {
  currentSection: string;
  children: any;
}
export default function RestV1(props: RestV1Props) {
  const { currentSection } = props;
  const sectionDescriptionProps = useSectionDescriptionProps(props);
  return (
    <RestApi
      title="PortOne REST API - V1"
      basepath={basepath}
      apiHost="https://api.iamport.kr"
      currentSection={currentSection}
      sectionDescriptionProps={sectionDescriptionProps}
      schema={schema}
    >
      <prose.p>
        결제완료된 정보, 결제취소, 상태별 결제목록 조회 등의 기능을 하는 REST
        API를 제공합니다.
        <br />
        비인증 결제, 정기 자동결제 등 부가기능을 위한 REST API도 제공합니다.
      </prose.p>
      <prose.p>
        <strong>V1 API hostname: </strong>
        <code>api.iamport.kr</code>
      </prose.p>
      <prose.p>
        <SchemaDownloadButton
          label="Swagger JSON 내려받기"
          href="https://raw.githubusercontent.com/portone-io/developers.portone.io/main/src/schema/v1.openapi.json"
        >
          <PostmanGuide href="https://learning.postman.com/docs/getting-started/importing-and-exporting/importing-from-swagger/" />
        </SchemaDownloadButton>
      </prose.p>
    </RestApi>
  );
}
