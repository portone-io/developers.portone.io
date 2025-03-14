import { describe, expect, it } from "vitest";

import { handleProseComponent } from "./prose";

describe("handleProseComponent", () => {
  it("h1 요소를 depth 1의 heading으로 변환한다", () => {
    // 테스트용 Prose 노드 생성
    const node = {
      type: "mdxJsxFlowElement",
      name: "prose.h1",
      children: [{ type: "text", value: "제목 텍스트" }],
    };

    // handleProseComponent 함수 실행
    const result = handleProseComponent(node, "h1");

    // 결과 검증
    expect(result).toEqual({
      type: "heading",
      depth: 1,
      children: [{ type: "text", value: "제목 텍스트" }],
    });
  });

  it("h2부터 h6까지 요소를 적절한 depth의 heading으로 변환한다", () => {
    // h2부터 h6까지 테스트
    for (let i = 2; i <= 6; i++) {
      // 테스트용 Prose 노드 생성
      const node = {
        type: "mdxJsxFlowElement",
        name: `prose.h${i}`,
        children: [{ type: "text", value: `제목 레벨 ${i}` }],
      };

      // handleProseComponent 함수 실행
      const result = handleProseComponent(node, `h${i}`);

      // 결과 검증
      expect(result).toEqual({
        type: "heading",
        depth: i,
        children: [{ type: "text", value: `제목 레벨 ${i}` }],
      });
    }
  });

  it("p 요소를 paragraph로 변환한다", () => {
    // 테스트용 Prose 노드 생성
    const node = {
      type: "mdxJsxFlowElement",
      name: "prose.p",
      children: [{ type: "text", value: "단락 텍스트" }],
    };

    // handleProseComponent 함수 실행
    const result = handleProseComponent(node, "p");

    // 결과 검증
    expect(result).toEqual({
      type: "paragraph",
      children: [{ type: "text", value: "단락 텍스트" }],
    });
  });

  it("a 요소를 링크로 변환한다", () => {
    // 테스트용 Prose 노드 생성 (링크 속성 포함)
    const node = {
      type: "mdxJsxFlowElement",
      name: "prose.a",
      attributes: [
        {
          type: "mdxJsxAttribute",
          name: "href",
          value: "https://example.com",
        },
        {
          type: "mdxJsxAttribute",
          name: "title",
          value: "예제 링크",
        },
      ],
      children: [{ type: "text", value: "링크 텍스트" }],
    };

    // handleProseComponent 함수 실행
    const result = handleProseComponent(node, "a");

    // 결과 검증
    expect(result).toEqual({
      type: "link",
      url: "https://example.com",
      title: "예제 링크",
      children: [{ type: "text", value: "링크 텍스트" }],
    });
  });

  it("href 속성이 없는 a 요소는 기본값 '#'을 사용한다", () => {
    // 테스트용 Prose 노드 생성 (href 속성 없음)
    const node = {
      type: "mdxJsxFlowElement",
      name: "prose.a",
      attributes: [
        {
          type: "mdxJsxAttribute",
          name: "title",
          value: "예제 링크",
        },
      ],
      children: [{ type: "text", value: "링크 텍스트" }],
    };

    // handleProseComponent 함수 실행
    const result = handleProseComponent(node, "a");

    // 결과 검증
    expect(result).toEqual({
      type: "link",
      url: "#",
      title: "예제 링크",
      children: [{ type: "text", value: "링크 텍스트" }],
    });
  });

  it("blockquote 요소를 인용구로 변환한다", () => {
    // 테스트용 Prose 노드 생성
    const node = {
      type: "mdxJsxFlowElement",
      name: "prose.blockquote",
      children: [
        {
          type: "paragraph",
          children: [{ type: "text", value: "인용구 텍스트" }],
        },
      ],
    };

    // handleProseComponent 함수 실행
    const result = handleProseComponent(node, "blockquote");

    // 결과 검증
    expect(result).toEqual({
      type: "blockquote",
      children: [
        {
          type: "paragraph",
          children: [{ type: "text", value: "인용구 텍스트" }],
        },
      ],
    });
  });

  it("ul 요소를 순서 없는 목록으로 변환한다", () => {
    // 테스트용 Prose 노드 생성
    const node = {
      type: "mdxJsxFlowElement",
      name: "prose.ul",
      children: [
        {
          type: "listItem",
          children: [{ type: "text", value: "항목 1" }],
        },
        {
          type: "listItem",
          children: [{ type: "text", value: "항목 2" }],
        },
      ],
    };

    // handleProseComponent 함수 실행
    const result = handleProseComponent(node, "ul");

    // 결과 검증
    expect(result).toEqual({
      type: "list",
      ordered: false,
      spread: false,
      children: [
        {
          type: "listItem",
          children: [{ type: "text", value: "항목 1" }],
        },
        {
          type: "listItem",
          children: [{ type: "text", value: "항목 2" }],
        },
      ],
    });
  });

  it("지원하지 않는 요소는 기본적으로 paragraph로 변환한다", () => {
    // 테스트용 Prose 노드 생성 (지원하지 않는 요소)
    const node = {
      type: "mdxJsxFlowElement",
      name: "prose.unknown",
      children: [{ type: "text", value: "알 수 없는 요소" }],
    };

    // handleProseComponent 함수 실행
    const result = handleProseComponent(node, "unknown");

    // 결과 검증
    expect(result).toEqual({
      type: "paragraph",
      children: [{ type: "text", value: "알 수 없는 요소" }],
    });
  });

  it("children이 없는 경우 빈 배열을 사용한다", () => {
    // 테스트용 Prose 노드 생성 (children 없음)
    const node = {
      type: "mdxJsxFlowElement",
      name: "prose.p",
    };

    // handleProseComponent 함수 실행
    const result = handleProseComponent(node, "p");

    // 결과 검증
    expect(result).toEqual({
      type: "paragraph",
      children: [],
    });
  });
});
