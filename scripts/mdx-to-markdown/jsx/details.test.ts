import type { MdxJsxFlowElement } from "mdast-util-mdx";
import type { Node } from "unist";
import { describe, expect, it, vi } from "vitest";

import {
  handleDetailsComponent,
  handleDetailsContentComponent,
  handleDetailsSummaryComponent,
} from "./details";

describe("handleDetailsComponent", () => {
  it("Details 컴포넌트를 HTML details 태그로 변환한다", () => {
    // 테스트용 Details 노드 생성
    const node = {
      type: "mdxJsxFlowElement",
      name: "Details",
      attributes: [],
      children: [
        {
          type: "paragraph",
          children: [{ type: "text", value: "내용" }],
        },
      ],
    } as MdxJsxFlowElement;

    // 목 transformRecursively 함수 생성
    const mockTransformRecursively = vi.fn((ast: Node) => ({
      ast,
      unhandledTags: new Set<string>(),
    }));

    // handleDetailsComponent 함수 실행
    const result = handleDetailsComponent(node, mockTransformRecursively);

    // 결과 검증
    expect(result.ast).toEqual({
      type: "root",
      children: [
        { type: "html", value: "<details>" },
        {
          type: "paragraph",
          children: [{ type: "text", value: "내용" }],
        },
        { type: "html", value: "</details>" },
      ],
    });
    expect(result.unhandledTags).toBeDefined();
    expect(result.unhandledTags.size).toBe(0);
  });

  it("자식 노드가 없는 경우 기본 텍스트를 사용한다", () => {
    // 테스트용 Details 노드 생성 (자식 없음)
    const node = {
      type: "mdxJsxFlowElement",
      name: "Details",
      attributes: [],
      children: [],
    } as MdxJsxFlowElement;

    // 목 transformRecursively 함수 생성
    const mockTransformRecursively = vi.fn((ast: Node) => ({
      ast,
      unhandledTags: new Set<string>(),
    }));

    // handleDetailsComponent 함수 실행
    const result = handleDetailsComponent(node, mockTransformRecursively);

    // 결과 검증
    expect(result.ast).toEqual({
      type: "root",
      children: [
        { type: "html", value: "<details>" },
        { type: "html", value: "</details>" },
      ],
    });
    expect(result.unhandledTags).toBeDefined();
    expect(result.unhandledTags.size).toBe(0);
  });
});

describe("handleDetailsSummaryComponent", () => {
  it("Summary 컴포넌트를 HTML summary 태그로 변환한다", () => {
    // 테스트용 Summary 노드 생성
    const node = {
      type: "mdxJsxFlowElement",
      name: "Details.Summary",
      attributes: [],
      children: [
        {
          type: "paragraph",
          children: [{ type: "text", value: "자세히 보기" }],
        },
      ],
    } as MdxJsxFlowElement;

    // 목 transformRecursively 함수 생성
    const mockTransformRecursively = vi.fn((ast: Node) => ({
      ast,
      unhandledTags: new Set<string>(),
    }));

    // handleDetailsSummaryComponent 함수 실행
    const result = handleDetailsSummaryComponent(
      node,
      mockTransformRecursively,
    );

    // 결과 검증
    expect(result.ast).toEqual({
      type: "root",
      children: [
        { type: "html", value: "<summary>" },
        {
          type: "paragraph",
          children: [{ type: "text", value: "자세히 보기" }],
        },
        { type: "html", value: "</summary>" },
      ],
    });
    expect(result.unhandledTags).toBeDefined();
    expect(result.unhandledTags.size).toBe(0);
  });

  it("자식 노드가 없는 경우 기본 텍스트를 사용한다", () => {
    // 테스트용 Summary 노드 생성 (자식 없음)
    const node = {
      type: "mdxJsxFlowElement",
      name: "Details.Summary",
      attributes: [],
      children: [],
    } as MdxJsxFlowElement;

    // 목 transformRecursively 함수 생성
    const mockTransformRecursively = vi.fn((ast: Node) => ({
      ast,
      unhandledTags: new Set<string>(),
    }));

    // handleDetailsSummaryComponent 함수 실행
    const result = handleDetailsSummaryComponent(
      node,
      mockTransformRecursively,
    );

    // 결과 검증
    expect(result.ast).toEqual({
      type: "root",
      children: [
        { type: "html", value: "<summary>" },
        { type: "html", value: "</summary>" },
      ],
    });
    expect(result.unhandledTags).toBeDefined();
    expect(result.unhandledTags.size).toBe(0);
  });
});

describe("handleDetailsContentComponent", () => {
  it("Content 컴포넌트의 내용을 그대로 반환한다", () => {
    // 테스트용 Content 노드 생성
    const node = {
      type: "mdxJsxFlowElement",
      name: "Details.Content",
      attributes: [],
      children: [
        {
          type: "paragraph",
          children: [{ type: "text", value: "상세 내용입니다." }],
        },
      ],
    } as MdxJsxFlowElement;

    // 목 transformRecursively 함수 생성
    const mockTransformRecursively = vi.fn((ast: Node) => ({
      ast,
      unhandledTags: new Set<string>(),
    }));

    // handleDetailsContentComponent 함수 실행
    const result = handleDetailsContentComponent(
      node,
      mockTransformRecursively,
    );

    // 결과 검증
    expect(result.ast).toEqual({
      type: "root",
      children: [
        {
          type: "paragraph",
          children: [{ type: "text", value: "상세 내용입니다." }],
        },
      ],
    });
    expect(result.unhandledTags).toBeDefined();
    expect(result.unhandledTags.size).toBe(0);
  });

  it("자식 노드가 없는 경우 빈 노드를 반환한다", () => {
    // 테스트용 Content 노드 생성 (자식 없음)
    const node = {
      type: "mdxJsxFlowElement",
      name: "Details.Content",
      attributes: [],
      children: [],
    } as MdxJsxFlowElement;

    // 목 transformRecursively 함수 생성
    const mockTransformRecursively = vi.fn((ast: Node) => ({
      ast,
      unhandledTags: new Set<string>(),
    }));

    // handleDetailsContentComponent 함수 실행
    const result = handleDetailsContentComponent(
      node,
      mockTransformRecursively,
    );

    // 결과 검증
    expect(result.ast).toEqual({
      type: "root",
      children: [],
    });
    expect(result.unhandledTags).toBeDefined();
    expect(result.unhandledTags.size).toBe(0);
  });
});
