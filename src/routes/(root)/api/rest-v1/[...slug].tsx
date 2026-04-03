import { Link, Title } from "@solidjs/meta";
import {
  createAsync,
  type RouteDefinition,
  useNavigate,
  useParams,
} from "@solidjs/router";
import { createEffect, createMemo, Match, Show, Switch } from "solid-js";

import V2MigrationBanner from "~/components/gitbook/V2MigrationBanner";
import Hint from "~/components/Hint";
import { prose } from "~/components/prose";
import { RestApiCategory, RestApiOverview } from "~/layouts/rest-api";
import createSectionDescriptionProps from "~/layouts/rest-api/misc/createSectionDescriptionProps";
import SchemaDownloadButton, {
  PostmanGuide,
} from "~/layouts/rest-api/misc/SchemaDownloadButton";
import NavMenu from "~/layouts/rest-api/nav-menu/NavMenu";
import {
  loadCategoryData,
  loadNavData,
  loadOverviewData,
} from "~/layouts/rest-api/schema-utils/load-schema";
import BackwardCompatibilityContent from "~/routes/(root)/api/backward-compatibility.mdx";

import V1Auth from "./_components/v1auth.mdx";

export const route = {
  preload: ({ params }) => {
    void loadNavData("v1");

    const section = params.slug || "overview";
    if (section === "overview") {
      void loadOverviewData("v1");
      return;
    }

    void loadCategoryData("v1", section);
  },
} satisfies RouteDefinition;

export default function ApiV1Docs() {
  const params = useParams<{ slug: string }>();
  const currentSection = createMemo(() => params.slug || "overview");
  const navData = createAsync(() => Promise.resolve(loadNavData("v1")), {
    deferStream: true,
  });

  const canonicalUrl = createMemo(
    () => `/api/rest-v1/${currentSection()}?v=v1`,
  );

  return (
    <>
      <Link rel="canonical" href={canonicalUrl()} />
      <Title>PortOne REST API - V1</Title>
      <Show when={navData()}>
        {(nav) => (
          <div class="flex gap-5">
            <NavMenu
              title="REST API - V1"
              basepath="/api/rest-v1"
              items={nav().categories}
              currentSection={currentSection()}
              emptyCategories={new Set(nav().emptyIds)}
            />
            <Switch>
              <Match when={currentSection() === "overview"}>
                <V1Overview />
              </Match>
              <Match when={currentSection() !== "overview"}>
                <V1Category section={currentSection()} />
              </Match>
            </Switch>
          </div>
        )}
      </Show>
    </>
  );
}

function V1Overview() {
  const groups = createAsync(() => Promise.resolve(loadOverviewData("v1")), {
    deferStream: true,
  });

  return (
    <Show when={groups()}>
      {(groups) => (
        <RestApiOverview
          title="PortOne REST API - V1"
          basepath="/api/rest-v1"
          groups={groups()}
        >
          <prose.p>
            결제완료된 정보, 결제취소, 상태별 결제목록 조회 등의 기능을 하는
            REST API를 제공합니다.
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
        </RestApiOverview>
      )}
    </Show>
  );
}

function V1Category(props: { section: string }) {
  const navigate = useNavigate();
  const sectionDescriptionProps = createSectionDescriptionProps({
    "section:auth": () => <V1Auth />,
  });
  const data = createAsync(() => loadCategoryData("v1", props.section), {
    deferStream: true,
  });
  const categoryData = createMemo(() => data());

  createEffect(() => {
    const redirect = categoryData()?.redirect;
    if (!redirect) return;
    void navigate(`/api/rest-v1/${redirect}`, { replace: true });
  });

  return (
    <Show when={categoryData()}>
      {(data) => (
        <Show when={!data().redirect}>
          <RestApiCategory
            basepath="/api/rest-v1"
            apiHost="https://api.iamport.kr"
            currentSection={props.section}
            sectionDescriptionProps={sectionDescriptionProps}
            group={data().group}
            schema={data().schema}
          />
        </Show>
      )}
    </Show>
  );
}
