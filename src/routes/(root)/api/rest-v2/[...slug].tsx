import { Link, Title } from "@solidjs/meta";
import { useParams } from "@solidjs/router";
import { createMemo, createSignal, onMount } from "solid-js";

import { prose } from "~/components/prose";
import RestApi from "~/layouts/rest-api";
import createSectionDescriptionProps from "~/layouts/rest-api/misc/createSectionDescriptionProps";
import SchemaDownloadButton, {
  PostmanGuide,
} from "~/layouts/rest-api/misc/SchemaDownloadButton";
import NavMenu from "~/layouts/rest-api/nav-menu/NavMenu";
import { getCategories } from "~/layouts/rest-api/schema-utils/category";
import BackwardCompatibilityContent from "~/routes/(root)/api/backward-compatibility.mdx";
import schema from "~/schema/v2.openapi.json";
import { useSystemVersion } from "~/state/system-version";

export default function ApiV2Docs() {
  const { setSystemVersion } = useSystemVersion();
  const params = useParams<{ slug: string }>();
  const [currentSection, setCurrentSection] = createSignal(
    params.slug.split("/")[0] ?? "",
  );
  const sectionDescriptionProps = createSectionDescriptionProps({});

  onMount(() => {
    setSystemVersion("v2");
  });

  const canonicalUrl = createMemo(() => {
    return `/api/rest-v2/${params.slug}?v=v2`;
  });

  return (
    <div class="flex gap-5">
      <Link rel="canonical" href={canonicalUrl()} />
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
          API 매개 변수 중 URL 경로 또는 query에 들어가는 문자열 값이 있는 경우,
          그 자리에 들어갈 수 없는 문자는 이스케이프하여야 합니다.
          자바스크립트의 <code>encodeURIComponent</code> 함수 등을 사용할 수
          있습니다.
          {/* TODO: 안전한 paymentId 사용에 대해 설명 */}
        </prose.p>
        <prose.h3 id="auth">인증 방식</prose.h3>
        <prose.p>
          V2 API를 사용하기 위해서는 V2 API Secret이 필요하며, 포트원 관리자콘솔
          내 결제연동 탭에서 발급받으실 수 있습니다.
        </prose.p>
        <prose.p>
          인증 관련 API를 제외한 모든 API는 HTTP <code>Authorization</code>{" "}
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
          GET 요청 시 body 대신 query 사용하기
        </prose.h3>
        <prose.p>
          GET 요청 시에 body(content)를 전달하는 것은 HTTP 표준에 부합하지 않아,
          클라이언트에 따라 사용 불가능한 경우가 있습니다.
        </prose.p>
        <prose.p>
          이 경우, body 문자열을 <code>requestBody</code> query 필드에 넣어
          주시면 됩니다. query 필드에 들어가는 문자열은 URL 인코드하셔야 합니다.
        </prose.p>
        <prose.h3 id="idempotency-key">멱등 키</prose.h3>
        <prose.p>
          <code>Idempotency-Key</code> 헤더는 네트워크 장애나 타임아웃 시 동일한
          요청이 중복 처리되는 것을 방지합니다. 자세한 표준은{" "}
          <prose.a href="https://datatracker.ietf.org/doc/draft-ietf-httpapi-idempotency-key-header/">
            IETF 문서
          </prose.a>
          를 참고하세요.
        </prose.p>
        <prose.h4>사용 방법</prose.h4>
        <prose.p>
          요청 헤더에 고유한 키를 포함하세요. UUID 등 고유한 문자열이어야
          합니다. 16~256자의 영문 대소문자, 숫자, -, _을 사용 가능합니다.
        </prose.p>
        <ul>
          <li>
            <code>Idempotency-Key: unique-request-id-123</code>
          </li>
        </ul>
        <prose.p>
          요청 타임아웃이 발생한 경우, 동일한 멱등 키를 사용하여 재시도할 수
          있습니다. 이 경우, 서버는 요청을 중복 처리하지 않고, 기존 응답을
          반환합니다.
        </prose.p>
        <prose.p>
          재시도에서 <code>IDEMPOTENCY_OUTSTANDING_REQUEST</code> 에러가 발생한
          경우, 시간이 조금 지난 후 다시 재시도해 주세요.
        </prose.p>
        <prose.ul>
          <li>지원 메서드: POST, PUT, PATCH, DELETE (GET은 무시됨)</li>
          <li>
            처리 중인 요청을 재시도하는 경우: 409 에러 (
            <code>{`{"type":"IDEMPOTENCY_OUTSTANDING_REQUEST"}...}`}</code>)
          </li>
          <li>완료된 요청을 재시도하는 경우: 기존 응답을 그대로 반환</li>
          <li>멱등성 보장 기간: 3시간 (추후 변경 가능)</li>
          <li>서로 다른 요청을 같은 멱등 키로 요청해서는 안 됩니다.</li>
        </prose.ul>
        <prose.h3 id="timeout-policy">요청 타임아웃 정책</prose.h3>
        <prose.p>
          API 호출시 PG 및 결제 원천사의 응답 지연을 고려하여 최소 60초의 읽기
          타임아웃 시간을 설정하도록 권장합니다.
        </prose.p>
        <prose.p>
          서버에서 요청 처리 중에 클라이언트 측에서 연결을 끊은 경우에도 요청이
          취소되지 않습니다. 이 경우 같은 멱등 키로 같은 요청을 재시도하면
          결과를 확인할 수 있습니다.
        </prose.p>
        <BackwardCompatibilityContent />
      </RestApi>
    </div>
  );
}
