import type { MdxJsxFlowElement } from "mdast-util-mdx";
import type { Node } from "unist";
import { describe, expect, it, vi } from "vitest";

import { handleSectionComponent } from "./section";

describe("handleSectionComponent", () => {
  it("Section 컴포넌트를 HTML 주석으로 변환한다", () => {
    // 테스트용 Section 노드 생성
    const node = {
      type: "mdxJsxFlowElement",
      name: "Section",
      attributes: [
        {
          type: "mdxJsxAttribute",
          name: "section",
          value: "example-section",
        },
      ],
      children: [
        {
          type: "paragraph",
          children: [{ type: "text", value: "섹션 내용입니다." }],
        },
      ],
    } as MdxJsxFlowElement;

    // 목 transformRecursively 함수 생성
    const mockTransformRecursively = vi.fn((ast: Node) => ({
      ast,
      unhandledTags: new Set<string>(),
    }));

    // handleSectionComponent 함수 실행
    const result = handleSectionComponent(node, mockTransformRecursively);

    // 결과 검증
    expect(result.ast).toEqual({
      type: "root",
      children: [
        { type: "html", value: "<!-- SECTION example-section START -->" },
        {
          type: "paragraph",
          children: [{ type: "text", value: "섹션 내용입니다." }],
        },
        { type: "html", value: "<!-- SECTION example-section END -->" },
      ],
    });
    expect(result.unhandledTags).toBeDefined();
    expect(result.unhandledTags.size).toBe(0);
  });

  it("section 속성이 없는 경우 'unnamed'를 사용한다", () => {
    // 테스트용 Section 노드 생성 (section 속성 없음)
    const node = {
      type: "mdxJsxFlowElement",
      name: "Section",
      attributes: [],
      children: [
        {
          type: "paragraph",
          children: [{ type: "text", value: "섹션 내용입니다." }],
        },
      ],
    } as MdxJsxFlowElement;

    // 목 transformRecursively 함수 생성
    const mockTransformRecursively = vi.fn((ast: Node) => ({
      ast,
      unhandledTags: new Set<string>(),
    }));

    // handleSectionComponent 함수 실행
    const result = handleSectionComponent(node, mockTransformRecursively);

    // 결과 검증
    expect(result.ast).toEqual({
      type: "root",
      children: [
        { type: "html", value: "<!-- SECTION unnamed START -->" },
        {
          type: "paragraph",
          children: [{ type: "text", value: "섹션 내용입니다." }],
        },
        { type: "html", value: "<!-- SECTION unnamed END -->" },
      ],
    });
    expect(result.unhandledTags).toBeDefined();
    expect(result.unhandledTags.size).toBe(0);
  });

  it("자식 노드가 없는 경우에도 주석을 올바르게 생성한다", () => {
    // 테스트용 Section 노드 생성 (자식 없음)
    const node = {
      type: "mdxJsxFlowElement",
      name: "Section",
      attributes: [
        {
          type: "mdxJsxAttribute",
          name: "section",
          value: "empty-section",
        },
      ],
      children: [],
    } as MdxJsxFlowElement;

    // 목 transformRecursively 함수 생성
    const mockTransformRecursively = vi.fn((ast: Node) => ({
      ast,
      unhandledTags: new Set<string>(),
    }));

    // handleSectionComponent 함수 실행
    const result = handleSectionComponent(node, mockTransformRecursively);

    // 결과 검증
    expect(result.ast).toEqual({
      type: "root",
      children: [
        { type: "html", value: "<!-- SECTION empty-section START -->" },
        { type: "html", value: "<!-- SECTION empty-section END -->" },
      ],
    });
    expect(result.unhandledTags).toBeDefined();
    expect(result.unhandledTags.size).toBe(0);
  });
});
