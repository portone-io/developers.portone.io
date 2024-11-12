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
        <prose.h3 id="backward-compatibility">하위호환성</prose.h3>
        <prose.p>
          포트원이 제공하는 모든 Stable API 에 대해 아래와 같은 하위호환성이
          보장됩니다.
        </prose.p>
        <ol>
          <li>
            <prose.p>
              현재 사용 가능한 입력 형식은 앞으로도 사용할 수 있습니다.
            </prose.p>
            <ul>
              <li> 입력 형식 내 필드 정의가 삭제되지 않습니다. </li>
              <li>
                <prose.p>
                  필수 입력 정보가 추가되거나, 선택 입력 정보가 필수로 변경되지
                  않습니다.
                </prose.p>
                <ul>
                  <li> 오로지 선택 입력 정보만 추가될 수 있습니다. </li>
                </ul>
              </li>
              <li>하위 필드의 형식(타입) 또한 위 규칙을 지키며 변경됩니다.</li>
              <li> enum 타입의 값이 삭제되지 않습니다. </li>
            </ul>
          </li>
          <li>
            <prose.p>출력 형식이 확장될 수 있지만, 축소되지 않습니다.</prose.p>
            <ul>
              <li> 출력 형식 내 필드 정의가 삭제되지 않습니다. </li>
              <li>
                사용 중인 필수 출력 정보가 선택사항으로 변경되거나 출력 시
                누락되지 않습니다.
              </li>
              <li>하위 필드의 형식(타입) 또한 위 규칙을 지키며 변경됩니다.</li>
              <li>
                <prose.p>
                  단,{" "}
                  <strong>
                    새로운 필드 또는 enum 값, oneOf 케이스가 추가될 수 있습니다.
                  </strong>
                </prose.p>
                <ul>
                  <li>
                    알지 못하는 필드 및 값이 주어지더라도 crash 가 발생하지
                    않도록 유의하여 개발해주세요.
                  </li>
                </ul>
              </li>
            </ul>
          </li>
        </ol>
        <prose.p>
          또한 <code>UNSTABLE</code> 이 표기된 일부 API 의 경우, 위 하위호환성
          정책과 무관하게 변경 및 지원 종료될 수 있으니 이용에 유의하세요.
        </prose.p>
      </RestApi>
    </div>
  );
}
