import RestApi, { Tag } from "~/layouts/rest-api/RestApi";
import schema from "../../schema/v1.openapi.json";

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
      <hr class="my-8" />
      <Tag
        schema={schema}
        title="authenticate"
        summary="REST API사용을 위한 인증(access_token취득)"
        endpoints={[{ method: "POST", path: "/users/getToken" }]}
      />
      <hr class="my-8" />
      <Tag
        schema={schema}
        title="payments"
        summary="결제내역 조회 및 결제 취소"
        endpoints={[
          { method: "GET", path: "/payments/{imp_uid}/balance" },
          { method: "GET", path: "/payments/{imp_uid}" },
          { method: "GET", path: "/payments" },
          {
            method: "GET",
            path: "/payments/find/{merchant_uid}/{payment_status}",
          },
          {
            method: "GET",
            path: "/payments/findAll/{merchant_uid}/{payment_status}",
          },
          { method: "GET", path: "/payments/status/{payment_status}" },
          { method: "POST", path: "/payments/cancel" },
        ]}
      />
    </RestApi>
  );
}
