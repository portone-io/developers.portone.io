import type { MdxJsxFlowElement } from "mdast-util-mdx";
import { describe, expect, it } from "vitest";

import { handleApiLinkComponent } from "./apiLink";

describe("handleApiLinkComponent", () => {
  it("rest-v1 API 링크를 마크다운 링크로 변환한다", () => {
    // MDX JSX 노드 생성
    const node: MdxJsxFlowElement = {
      type: "mdxJsxFlowElement",
      name: "ApiLink",
      attributes: [
        {
          type: "mdxJsxAttribute",
          name: "basepath",
          value: "/api/rest-v1",
        },
        {
          type: "mdxJsxAttribute",
          name: "section",
          value: "payment",
        },
        {
          type: "mdxJsxAttribute",
          name: "method",
          value: "post",
        },
        {
          type: "mdxJsxAttribute",
          name: "path",
          value: "/payments",
        },
      ],
      children: [],
      data: {},
    };

    // handleApiLinkComponent 함수 실행
    const result = handleApiLinkComponent(node);

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
    // MDX JSX 노드 생성
    const node: MdxJsxFlowElement = {
      type: "mdxJsxFlowElement",
      name: "ApiLink",
      attributes: [
        {
          type: "mdxJsxAttribute",
          name: "basepath",
          value: "/api/rest-v2",
        },
        {
          type: "mdxJsxAttribute",
          name: "section",
          value: "payment",
        },
        {
          type: "mdxJsxAttribute",
          name: "method",
          value: "get",
        },
        {
          type: "mdxJsxAttribute",
          name: "path",
          value: "/payments/{payment_id}",
        },
        {
          type: "mdxJsxAttribute",
          name: "apiName",
          value: "결제 조회 API",
        },
      ],
      children: [],
      data: {},
    };

    // handleApiLinkComponent 함수 실행
    const result = handleApiLinkComponent(node);

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
    // MDX JSX 노드 생성 (method 속성 없음)
    const node: MdxJsxFlowElement = {
      type: "mdxJsxFlowElement",
      name: "ApiLink",
      attributes: [
        {
          type: "mdxJsxAttribute",
          name: "basepath",
          value: "/api/rest-v1",
        },
        {
          type: "mdxJsxAttribute",
          name: "section",
          value: "payment",
        },
        {
          type: "mdxJsxAttribute",
          name: "path",
          value: "/payments",
        },
      ],
      children: [],
      data: {},
    };

    // handleApiLinkComponent 함수 실행
    const result = handleApiLinkComponent(node);

    // 결과 검증
    expect(result).toEqual({
      type: "text",
      value: "[API Link]",
    });
  });
});
