import { Title } from "@solidjs/meta";
import { useParams } from "@solidjs/router";
import { createSignal } from "solid-js";

import Hint from "~/components/Hint";
import * as prose from "~/components/prose";
import RestApi from "~/layouts/rest-api";
import createSectionDescriptionProps from "~/layouts/rest-api/misc/createSectionDescriptionProps";
import SchemaDownloadButton, {
  PostmanGuide,
} from "~/layouts/rest-api/misc/SchemaDownloadButton";
import NavMenu from "~/layouts/rest-api/nav-menu/NavMenu";
import { getCategories } from "~/layouts/rest-api/schema-utils/category";
import BackwardCompatibilityContent from "~/routes/(root)/api/backward-compatibility";
import schema from "~/schema/v1.openapi.json";
import { useSystemVersion } from "~/state/system-version";

import V1Auth from "./_components/v1auth.mdx";

export default function ApiV1Docs() {
  const { setSystemVersion } = useSystemVersion();
  const params = useParams<{ slug: string }>();
  const [currentSection, setCurrentSection] = createSignal(
    params.slug.split("/")[0] ?? "",
  );
  const sectionDescriptionProps = createSectionDescriptionProps({
    "section:auth": () => <V1Auth />,
  });

  setSystemVersion("v1");

  return (
    <div class="flex">
      <Title>PortOne REST API - V1</Title>
      <NavMenu
        title="REST API - V1"
        basepath="/api/rest-v1"
        items={getCategories(schema)}
        currentSection={currentSection()}
        onSectionChange={setCurrentSection}
      />
      <RestApi
        title="PortOne REST API - V1"
        basepath="/api/rest-v1"
        apiHost="https://api.iamport.kr"
        currentSection={currentSection()}
        sectionDescriptionProps={sectionDescriptionProps}
        schema={schema}
      >
        <prose.p>
          결제완료된 정보, 결제취소, 상태별 결제목록 조회 등의 기능을 하는 REST
          API를 제공합니다.
          <br />
          비인증 결제, 정기 자동결제 등 부가기능을 위한 REST API도 제공합니다.
        </prose.p>
        <Hint style="danger">
          2024년 9월 1일부로 포트원 V1 API에 대해 일부 보안 규격이 지원
          종료됩니다.
          <br />
          자세한 사항은
          <a href="/opi/ko/support/tls-support?v=v1" style="color:orange">
            TLS 지원 범위
          </a>
          를 참고해주세요.
        </Hint>
        <prose.p>
          <strong>V1 API hostname: </strong>
          <code>api.iamport.kr</code>
        </prose.p>
        <prose.p>
          <SchemaDownloadButton
            label="Swagger JSON 내려받기"
            href="/api/schema/v1/openapi.json"
            download="portone-v1-swagger.json"
          >
            <PostmanGuide href="https://learning.postman.com/docs/getting-started/importing-and-exporting/importing-from-swagger/" />
          </SchemaDownloadButton>
        </prose.p>
        <br />
        <BackwardCompatibilityContent version="v1" />
      </RestApi>
    </div>
  );
}
