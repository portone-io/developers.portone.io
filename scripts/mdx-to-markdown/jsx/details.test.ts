import type { MdxJsxFlowElement } from "mdast-util-mdx";
import type { Node } from "unist";
import { describe, expect, it } from "vitest";

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

    // 목 transformJsxComponentsFn 함수 생성
    const mockTransformJsxComponentsFn = (_ast: Node) => {
      // 테스트에서는 아무 작업도 하지 않음
    };

    // handleDetailsComponent 함수 실행
    const result = handleDetailsComponent(node, mockTransformJsxComponentsFn);

    // 결과 검증
    expect(result).toEqual({
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
  });

  it("자식 노드가 없는 경우 기본 텍스트를 사용한다", () => {
    // 테스트용 Details 노드 생성 (자식 없음)
    const node = {
      type: "mdxJsxFlowElement",
      name: "Details",
      attributes: [],
      children: [],
    } as MdxJsxFlowElement;

    // 목 transformJsxComponentsFn 함수 생성
    const mockTransformJsxComponentsFn = (_ast: Node) => {
      // 테스트에서는 아무 작업도 하지 않음
    };

    // handleDetailsComponent 함수 실행
    const result = handleDetailsComponent(node, mockTransformJsxComponentsFn);

    // 결과 검증
    expect(result).toEqual({
      type: "root",
      children: [
        { type: "html", value: "<details>" },
        { type: "text", value: "상세 정보" },
        { type: "html", value: "</details>" },
      ],
    });
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

    // 목 transformJsxComponentsFn 함수 생성
    const mockTransformJsxComponentsFn = (_ast: Node) => {
      // 테스트에서는 아무 작업도 하지 않음
    };

    // handleDetailsSummaryComponent 함수 실행
    const result = handleDetailsSummaryComponent(
      node,
      mockTransformJsxComponentsFn,
    );

    // 결과 검증
    expect(result).toEqual({
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
  });

  it("자식 노드가 없는 경우 기본 텍스트를 사용한다", () => {
    // 테스트용 Summary 노드 생성 (자식 없음)
    const node = {
      type: "mdxJsxFlowElement",
      name: "Details.Summary",
      attributes: [],
      children: [],
    } as MdxJsxFlowElement;

    // 목 transformJsxComponentsFn 함수 생성
    const mockTransformJsxComponentsFn = (_ast: Node) => {
      // 테스트에서는 아무 작업도 하지 않음
    };

    // handleDetailsSummaryComponent 함수 실행
    const result = handleDetailsSummaryComponent(
      node,
      mockTransformJsxComponentsFn,
    );

    // 결과 검증
    expect(result).toEqual({
      type: "root",
      children: [
        { type: "html", value: "<summary>" },
        { type: "text", value: "상세 정보" },
        { type: "html", value: "</summary>" },
      ],
    });
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

    // 목 transformJsxComponentsFn 함수 생성
    const mockTransformJsxComponentsFn = (_ast: Node) => {
      // 테스트에서는 아무 작업도 하지 않음
    };

    // handleDetailsContentComponent 함수 실행
    const result = handleDetailsContentComponent(
      node,
      mockTransformJsxComponentsFn,
    );

    // 결과 검증
    expect(result).toEqual({
      type: "root",
      children: [
        {
          type: "paragraph",
          children: [{ type: "text", value: "상세 내용입니다." }],
        },
      ],
    });
  });

  it("자식 노드가 없는 경우 빈 노드를 반환한다", () => {
    // 테스트용 Content 노드 생성 (자식 없음)
    const node = {
      type: "mdxJsxFlowElement",
      name: "Details.Content",
      attributes: [],
      children: [],
    } as MdxJsxFlowElement;

    // 목 transformJsxComponentsFn 함수 생성
    const mockTransformJsxComponentsFn = (_ast: Node) => {
      // 테스트에서는 아무 작업도 하지 않음
    };

    // handleDetailsContentComponent 함수 실행
    const result = handleDetailsContentComponent(
      node,
      mockTransformJsxComponentsFn,
    );

    // 결과 검증
    expect(result).toEqual({
      type: "root",
      children: [],
    });
  });
});
