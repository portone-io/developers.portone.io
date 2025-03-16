import type { MdxJsxFlowElement } from "mdast-util-mdx";
import type { Node } from "unist";
import { describe, expect, it } from "vitest";

import { handleDetailsComponent } from "./details";

describe("handleDetailsComponent", () => {
  it("Summary와 Content가 있는 Details 컴포넌트를 HTML details/summary로 변환한다", () => {
    // 테스트용 Details 노드 생성
    const node = {
      type: "mdxJsxFlowElement",
      name: "Details",
      children: [
        {
          type: "mdxJsxFlowElement",
          name: "Details.Summary",
          children: [
            {
              type: "paragraph",
              children: [{ type: "text", value: "자세히 보기" }],
            },
          ],
        },
        {
          type: "mdxJsxFlowElement",
          name: "Details.Content",
          children: [
            {
              type: "paragraph",
              children: [{ type: "text", value: "상세 내용입니다." }],
            },
          ],
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
        { type: "html", value: "<summary>" },
        {
          type: "paragraph",
          children: [{ type: "text", value: "자세히 보기" }],
        },
        { type: "html", value: "</summary>" },
        {
          type: "paragraph",
          children: [{ type: "text", value: "상세 내용입니다." }],
        },
        { type: "html", value: "</details>" },
      ],
    });
  });

  it("Summary가 없는 경우 기본 텍스트를 사용한다", () => {
    // 테스트용 Details 노드 생성 (Summary 없음)
    const node = {
      type: "mdxJsxFlowElement",
      name: "Details",
      children: [
        {
          type: "mdxJsxFlowElement",
          name: "Details.Content",
          children: [
            {
              type: "paragraph",
              children: [{ type: "text", value: "상세 내용입니다." }],
            },
          ],
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
        { type: "html", value: "<summary>" },
        { type: "text", value: "상세 정보" },
        { type: "html", value: "</summary>" },
        {
          type: "paragraph",
          children: [{ type: "text", value: "상세 내용입니다." }],
        },
        { type: "html", value: "</details>" },
      ],
    });
  });

  it("Content가 없는 경우에도 정상적으로 처리한다", () => {
    // 테스트용 Details 노드 생성 (Content 없음)
    const node = {
      type: "mdxJsxFlowElement",
      name: "Details",
      children: [
        {
          type: "mdxJsxFlowElement",
          name: "Details.Summary",
          children: [
            {
              type: "paragraph",
              children: [{ type: "text", value: "자세히 보기" }],
            },
          ],
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
        { type: "html", value: "<summary>" },
        {
          type: "paragraph",
          children: [{ type: "text", value: "자세히 보기" }],
        },
        { type: "html", value: "</summary>" },
        { type: "html", value: "</details>" },
      ],
    });
  });
});
