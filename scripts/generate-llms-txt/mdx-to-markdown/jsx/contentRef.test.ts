import { describe, expect, it } from "vitest";

import { handleContentRefComponent } from "./contentRef";

describe("handleContentRefComponent", () => {
  it("slug가 있고 해당 문서가 존재하는 경우 제목으로 링크를 생성한다", () => {
    // 테스트용 ContentRef 노드 생성
    const node = {
      type: "mdxJsxFlowElement",
      name: "ContentRef",
    };

    // 테스트용 parseResultMap 생성
    const parseResultMap = {
      "guide/payment": {
        filePath: "/path/to/guide/payment.mdx",
        slug: "guide/payment",
        frontmatter: {
          title: "결제 가이드",
        },
        imports: [],
        ast: {},
        content: "",
      },
    };

    // handleContentRefComponent 함수 실행
    const result = handleContentRefComponent(
      node,
      { slug: "guide/payment" },
      parseResultMap,
    );

    // 결과 검증
    expect(result).toEqual({
      type: "paragraph",
      children: [
        {
          type: "link",
          url: "/llms/guide/payment.md",
          children: [{ type: "text", value: "결제 가이드" }],
        },
      ],
    });
  });

  it("slug가 있지만 해당 문서가 존재하지 않는 경우 기본 텍스트로 링크를 생성한다", () => {
    // 테스트용 ContentRef 노드 생성
    const node = {
      type: "mdxJsxFlowElement",
      name: "ContentRef",
    };

    // 빈 parseResultMap 생성
    const parseResultMap = {};

    // handleContentRefComponent 함수 실행
    const result = handleContentRefComponent(
      node,
      { slug: "non-existent/page" },
      parseResultMap,
    );

    // 결과 검증
    expect(result).toEqual({
      type: "paragraph",
      children: [
        {
          type: "link",
          url: "/llms/non-existent/page.md",
          children: [{ type: "text", value: "링크" }],
        },
      ],
    });
  });

  it("slug가 '/'로 시작하는 경우 정상적으로 처리한다", () => {
    // 테스트용 ContentRef 노드 생성
    const node = {
      type: "mdxJsxFlowElement",
      name: "ContentRef",
    };

    // 테스트용 parseResultMap 생성
    const parseResultMap = {
      "api/overview": {
        filePath: "/path/to/api/overview.mdx",
        slug: "api/overview",
        frontmatter: {
          title: "API 개요",
        },
        imports: [],
        ast: {},
        content: "",
      },
    };

    // handleContentRefComponent 함수 실행 (slug가 '/'로 시작)
    const result = handleContentRefComponent(
      node,
      { slug: "/api/overview" },
      parseResultMap,
    );

    // 결과 검증
    expect(result).toEqual({
      type: "paragraph",
      children: [
        {
          type: "link",
          url: "/llms/api/overview.md",
          children: [{ type: "text", value: "API 개요" }],
        },
      ],
    });
  });
});
