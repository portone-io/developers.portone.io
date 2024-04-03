import type React from "preact/compat";

import * as prose from "~/components/prose";
import RestApi from "~/layouts/rest-api";
import SchemaDownloadButton, {
  PostmanGuide,
} from "~/layouts/rest-api/misc/SchemaDownloadButton";
import useSectionDescriptionProps from "~/layouts/rest-api/misc/useSectionDescriptionProps";
import schema from "~/schema/v2.openapi.json";

export type RestV2Props = {
  currentSection: string;
  [_: `section:${string}`]: React.ReactNode;
};

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
        API 결제, 결제 정보 조회, 결제 취소 등의 기능을 제공하는 REST API입니다.
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
      <prose.h3>요청 및 응답 형식</prose.h3>
      <prose.p>
        요청과 응답의 본문은 JSON 형식입니다.
        <br />
        API 응답에 포함된 필드는 별도 안내 없이 추가될 수 있으니, 알지 못하는
        필드가 있는 경우에는 무시하도록 개발해 주세요.
      </prose.p>
      <prose.p>
        API 매개 변수 중 URL 경로에 들어가는 문자열 값이 있는 경우, URL 경로에
        들어갈 수 없는 문자열은 이스케이프하여야 합니다. 자바스크립트의{" "}
        <code>encodeURIComponent</code> 함수 등을 사용할 수 있습니다.
        {/* TODO: 안전한 paymentId 사용에 대해 설명 */}
      </prose.p>
      <prose.h3 id="auth">인증 방식</prose.h3>
      <prose.p>
        V2 API를 사용하기 위해서는 V2 API Secret이 필요하며, 포트원 콘솔 내
        결제연동 탭에서 발급받을 수 있습니다.
      </prose.p>
      <prose.p>
        인증 관련 API를 제외한 모든 API는 HTTP <code>Authorization</code> 헤더로
        인증 정보를 전달해 주셔야 합니다. Authorization 헤더에 전달하는 형식은
        두 가지 중 하나입니다.
      </prose.p>
      <ul>
        <li>
          API Secret 직접 사용 (간편)
          <br />
          Authorization: PortOne <i>MY_API_SECRET</i>
        </li>
        <li>
          액세스 토큰 사용
          <br />
          Authorization: Bearer <i>MY_ACCESS_TOKEN</i>
        </li>
      </ul>
      액세스 토큰을 사용한 인증을 원하는 경우, 인증 관련 API를 이용해 주세요.
    </RestApi>
  );
}
