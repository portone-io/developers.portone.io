import { describe, expect, it } from "vitest";

import { handleApiLinkComponent } from "./apiLink";

describe("handleApiLinkComponent", () => {
  it("rest-v1 API 링크를 마크다운 링크로 변환한다", () => {
    // props 객체 생성
    const props = {
      basepath: "/api/rest-v1",
      section: "payment",
      method: "post",
      path: "/payments",
    };

    // handleApiLinkComponent 함수 실행
    const result = handleApiLinkComponent(props);

    // 결과 검증
    expect(result).toEqual({
      type: "paragraph",
      children: [
        {
          type: "link",
          url: "https://developers.portone.io/schema/v1.openapi.yml",
          children: [
            {
              type: "text",
              value: "POST /payments",
            },
          ],
        },
      ],
    });
  });

  it("rest-v2 API 링크를 마크다운 링크로 변환한다 (apiName 포함)", () => {
    // props 객체 생성
    const props = {
      basepath: "/api/rest-v2",
      section: "payment",
      method: "get",
      path: "/payments/{payment_id}",
      apiName: "결제 조회 API",
    };

    // handleApiLinkComponent 함수 실행
    const result = handleApiLinkComponent(props);

    // 결과 검증
    expect(result).toEqual({
      type: "paragraph",
      children: [
        {
          type: "link",
          url: "https://developers.portone.io/schema/v2.openapi.yml",
          children: [
            {
              type: "text",
              value: "결제 조회 API - GET /payments/{payment_id}",
            },
          ],
        },
      ],
    });
  });

  it("필수 속성이 없는 경우 기본 텍스트를 반환한다", () => {
    // props 객체 생성 (method 속성 없음)
    const props = {
      basepath: "/api/rest-v1",
      section: "payment",
      path: "/payments",
    };

    // handleApiLinkComponent 함수 실행
    const result = handleApiLinkComponent(props);

    // 결과 검증
    expect(result).toEqual({
      type: "text",
      value: "[API Link]",
    });
  });
});
