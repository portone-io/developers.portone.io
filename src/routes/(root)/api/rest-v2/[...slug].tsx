import { Title } from "@solidjs/meta";
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
import BackwardCompatibilityContent from "~/routes/(root)/api/backward-compatibility";
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
      <Title>PortOne REST API - V2</Title>
      <NavMenu
        title="REST API - V2"
        basepath="/api/rest-v2"
        items={getCategories(schema)}
        currentSection={currentSection()}
        onSectionChange={setCurrentSection}
      >
        <hr />
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
            href="/api/schema/v2/openapi.json"
            download="portone-v2-openapi.json"
          >
            <PostmanGuide href="https://learning.postman.com/docs/integrations/available-integrations/working-with-openAPI/" />
          </SchemaDownloadButton>
        </prose.p>
        <prose.h3>요청 및 응답 형식</prose.h3>
        <prose.p>요청과 응답의 본문은 JSON 형식입니다.</prose.p>
        <prose.p>
          API 매개 변수 중 URL 경로에 들어가는 문자열 값이 있는 경우, URL 경로에
          들어갈 수 없는 문자열은 이스케이프하여야 합니다. 자바스크립트의{" "}
          <code>encodeURIComponent</code> 함수 등을 사용할 수 있습니다.
          {/* TODO: 안전한 paymentId 사용에 대해 설명 */}
        </prose.p>
        <prose.h3 id="auth">인증 방식</prose.h3>
        <prose.p>
          V2 API 를 사용하기 위해서는 V2 API Secret 이 필요하며, 포트원
          관리자콘솔 내 결제연동 탭에서 발급받으실 수 있습니다.
        </prose.p>
        <prose.p>
          인증 관련 API 를 제외한 모든 API 는 HTTP <code>Authorization</code>{" "}
          헤더로 아래 형식의 인증 정보를 전달해주셔야 합니다.
        </prose.p>
        <ul>
          <li>
            <code>
              Authorization: PortOne <i>MY_API_SECRET</i>
            </code>
          </li>
        </ul>
        <prose.h3 id="get-with-body">
          GET 요청 시 Body 대신 Query 사용하기
        </prose.h3>
        <prose.p>
          GET 요청 시에 Body 를 전달해야 하는 경우, Body 대신 Query 를 사용할 수
          있습니다.
        </prose.p>
        <prose.p>
          이 경우, Body 객체를 <code>requestBody</code> Query 필드에 넣어주시면
          됩니다.
        </prose.p>
        <BackwardCompatibilityContent version="v2" />
      </RestApi>
    </div>
  );
}
