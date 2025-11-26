import { Link, Title } from "@solidjs/meta";
import { useParams } from "@solidjs/router";
import { createMemo, createSignal, onMount } from "solid-js";

import V2MigrationBanner from "~/components/gitbook/V2MigrationBanner";
import Hint from "~/components/Hint";
import { prose } from "~/components/prose";
import RestApi from "~/layouts/rest-api";
import createSectionDescriptionProps from "~/layouts/rest-api/misc/createSectionDescriptionProps";
import SchemaDownloadButton, {
  PostmanGuide,
} from "~/layouts/rest-api/misc/SchemaDownloadButton";
import NavMenu from "~/layouts/rest-api/nav-menu/NavMenu";
import { getCategories } from "~/layouts/rest-api/schema-utils/category";
import BackwardCompatibilityContent from "~/routes/(root)/api/backward-compatibility.mdx";
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

  onMount(() => {
    setSystemVersion("v1");
  });

  const canonicalUrl = createMemo(() => {
    return `/api/rest-v1/${params.slug}?v=v1`;
  });

  return (
    <div class="flex gap-5">
      <Link rel="canonical" href={canonicalUrl()} />
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
        <V2MigrationBanner lang="ko" />
        <Hint style="danger">
          <prose.p>
            2026년 1월 26일부로 포트원 V1 결제내역 단건조회 API에 동작 변경이
            있습니다.
          </prose.p>
          <prose.p>
            자세한 사항은{" "}
            <prose.a href="https://help.portone.io/news/content/notice-v1-api-2025-11-25">
              V1 결제내역 단건조회 API 동작 변경 안내
            </prose.a>
            를 참고해주세요.
          </prose.p>
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
        <BackwardCompatibilityContent />
        <prose.h3>하위 상점의 API 사용</prose.h3>
        <prose.p>
          하위 상점에 대해 API를 사용하려는 경우 API 호출 시 Tier 헤더(HTTP
          Request Header)로 하위상점의 티어코드를 전달해야 합니다.
          <br />
          <prose.a href="/opi/ko/support/agency-and-tier">
            [Agency & Tier 란?]
          </prose.a>
        </prose.p>
      </RestApi>
    </div>
  );
}
