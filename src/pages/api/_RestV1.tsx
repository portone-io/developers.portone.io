import RestApi, { Hr } from "~/layouts/rest-api";
import schema from "../../schema/v1.openapi.json";
import { Tags } from "~/layouts/rest-api/tag";
import { TypeDefinitions } from "~/layouts/rest-api/type-def";

export default function RestV1() {
  return (
    <RestApi title="PortOne REST API - V1">
      <p class="mt-4">
        결제완료된 정보, 결제취소, 상태별 결제목록 조회 등의 기능을 하는 REST
        API를 제공합니다.
      </p>
      <p>
        비인증 결제, 정기 자동결제 등 부가기능을 위한 REST API도 제공합니다.
      </p>
      <Hr />
      <Tags schema={schema} />
      <Hr />
      <TypeDefinitions schema={schema} />
    </RestApi>
  );
}
