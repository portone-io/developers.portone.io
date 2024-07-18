import { useParams } from "@solidjs/router";
import { createSignal } from "solid-js";

import * as prose from "~/components/prose";
import RestApi from "~/layouts/rest-api";
import createSectionDescriptionProps from "~/layouts/rest-api/misc/createSectionDescriptionProps";
import SchemaDownloadButton, {
  PostmanGuide,
} from "~/layouts/rest-api/misc/SchemaDownloadButton";
import NavMenu from "~/layouts/rest-api/nav-menu/NavMenu";
import { getCategories } from "~/layouts/rest-api/schema-utils/category";
import schema from "~/schema/v2.openapi.json";
import { useSystemVersion } from "~/state/system-version";

export default function ApiV2Docs() {
  const { setSystemVersion } = useSystemVersion();
  const params = useParams<{ slug: string }>();
  const [currentSection, setCurrentSection] = createSignal(
    params.slug.split("/")[0] ?? "",
  );
  const sectionDescriptionProps = createSectionDescriptionProps({});

  setSystemVersion("v2");

  return (
    <div class="flex">
      <NavMenu
        title="REST API - V2"
        basepath="/api/rest-v2"
        items={getCategories(schema)}
        currentSection={currentSection()}
        onSectionChange={setCurrentSection}
      >
        <hr />
        <a href="/api/rest-v2-legacy" class="text-slate-4 hover:underline">
          런칭 이전 V2 API 문서 확인하기
        </a>
      </NavMenu>
      <RestApi
        title="PortOne REST API - V2"
        basepath="/api/rest-v2"
        apiHost="https://api.portone.io"
        currentSection={currentSection()}
        sectionDescriptionProps={sectionDescriptionProps}
        schema={schema}
      >
        <prose.p>
          API 결제, 결제 정보 조회, 결제 취소 등의 기능을 제공하는 REST
          API입니다.
        </prose.p>
        <prose.p>
          <strong>V2 API hostname: </strong>
          <code>api.portone.io</code>
        </prose.p>
        <prose.p>
          <SchemaDownloadButton
            label="OpenAPI JSON 내려받기"
            href="/api/schema/v2.openapi.json"
            download="portone-v2-openapi.json"
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
          인증 관련 API를 제외한 모든 API는 HTTP <code>Authorization</code>{" "}
          헤더로 인증 정보를 전달해 주셔야 합니다. Authorization 헤더에 전달하는
          형식은 두 가지 중 하나입니다.
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
        <prose.h3 id="get-with-body">GET 요청 시 Body 대신 Query 사용</prose.h3>
        <prose.p>
          GET 요청 시에 Body를 사용해야 하는 경우, Body 대신 Query를 사용할 수
          있습니다.
        </prose.p>
        <prose.p>
          이 경우, Body 객체를 <code>requestBody</code> Query 필드에 넣어주시면
          됩니다.
        </prose.p>
      </RestApi>
    </div>
  );
}
