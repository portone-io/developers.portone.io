import Hint from "~/components/gitbook/Hint";
import * as prose from "~/components/prose";
import RestApi from "~/layouts/rest-api";
import ApiLink from "~/layouts/rest-api/misc/ApiLink";
import SchemaDownloadButton, {
  PostmanGuide,
} from "~/layouts/rest-api/misc/SchemaDownloadButton";
import schema from "~/schema/v1.openapi.json";

import merchantInfoImage from "./_assets/merchant-info.png";
import Figure from "~/components/gitbook/Figure";

const basepath = "/api/rest-v1";

export interface RestV1Props {
  currentSection: string;
}
export default function RestV1({ currentSection }: RestV1Props) {
  return (
    <RestApi
      title="PortOne REST API - V1"
      basepath={basepath}
      apiHost="https://api.iamport.kr"
      currentSection={currentSection}
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
      <prose.h2>API 인증</prose.h2>
      <prose.p>
        포트원 API를 호출할 때는 <strong>액세스 토큰</strong>을{" "}
        <code>Authorization</code> 헤더에 넣어주어야 합니다.
        <br />
        액세스 토큰은{" "}
        <ApiLink
          basepath={basepath}
          section="auth"
          method="post"
          path="/users/getToken"
          apiName="액세스 토큰 발급 API"
        />
        를 호출해서 발급받을 수 있습니다.
      </prose.p>
      <prose.p>
        액세스 토큰 발급 API를 호출하려면 <strong>API 키</strong>와{" "}
        <strong>API 시크릿</strong>을 인자로 넣어주어야 합니다.
      </prose.p>
      <prose.p>
        <Figure
          width="720"
          src={merchantInfoImage}
          caption={
            <>
              <strong>API 키</strong>와 <strong>API 시크릿</strong>은 관리자
              콘솔 → <code>상점 ・ 계정 관리</code> 메뉴 →{" "}
              <code>내 식별코드 ・ API Keys</code> 모달을 열어서 확인하실 수
              있습니다.
            </>
          }
        />
      </prose.p>
      <Hint style="danger">
        <strong>API 시크릿은 절대로 외부에 노출되어서는 안되는 값</strong>
        입니다. <br /> 액세스 토큰 발급은 무조건 서버사이드에서 실행해주세요.
      </Hint>
    </RestApi>
  );
}
