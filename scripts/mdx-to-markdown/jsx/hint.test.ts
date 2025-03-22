import type { MdxJsxFlowElement } from "mdast-util-mdx";
import type { Node } from "unist";
import { describe, expect, it, vi } from "vitest";

import { handleHintComponent } from "./hint";

describe("handleHintComponent", () => {
  it("기본 Hint 컴포넌트를 HTML div로 변환한다", () => {
    // 테스트용 Hint 노드 생성
    const node = {
      type: "mdxJsxFlowElement",
      name: "Hint",
      children: [
        {
          type: "paragraph",
          children: [{ type: "text", value: "힌트 내용입니다." }],
        },
      ],
    } as MdxJsxFlowElement;

    // Mock transformRecursively 함수 생성
    const mockTransformRecursively = vi.fn((ast: Node) => ({
      ast,
      unhandledTags: new Set<string>(),
    }));

    // handleHintComponent 함수 실행
    const result = handleHintComponent(node, mockTransformRecursively);

    // 결과 검증
    expect(result.ast).toEqual({
      type: "root",
      children: [
        {
          type: "html",
          value: '<div class="hint">',
        },
        {
          type: "paragraph",
          children: [{ type: "text", value: "힌트 내용입니다." }],
        },
        {
          type: "html",
          value: "</div>",
        },
      ],
    });
    expect(result.unhandledTags.size).toBe(0);
  });

  it("type 속성이 있는 Hint 컴포넌트를 처리한다", () => {
    // 테스트용 Hint 노드 생성 (type 속성 포함)
    const node = {
      type: "mdxJsxFlowElement",
      name: "Hint",
      children: [
        {
          type: "paragraph",
          children: [{ type: "text", value: "경고 메시지입니다." }],
        },
      ],
    } as MdxJsxFlowElement;

    // 속성 추가
    node.attributes = [
      {
        type: "mdxJsxAttribute",
        name: "type",
        value: "warning",
      },
    ];

    // Mock transformRecursively 함수 생성
    const mockTransformRecursively = vi.fn((ast: Node) => ({
      ast,
      unhandledTags: new Set<string>(),
    }));

    // handleHintComponent 함수 실행
    const result = handleHintComponent(node, mockTransformRecursively);

    // 결과 검증
    expect(result.ast).toEqual({
      type: "root",
      children: [
        {
          type: "html",
          value: '<div class="hint hint-warning">',
        },
        {
          type: "paragraph",
          children: [{ type: "text", value: "경고 메시지입니다." }],
        },
        {
          type: "html",
          value: "</div>",
        },
      ],
    });
    expect(result.unhandledTags.size).toBe(0);
  });

  it("여러 속성이 있는 Hint 컴포넌트를 처리한다", () => {
    // 테스트용 Hint 노드 생성
    const node = {
      type: "mdxJsxFlowElement",
      name: "Hint",
      children: [
        {
          type: "paragraph",
          children: [{ type: "text", value: "중요 정보입니다." }],
        },
      ],
    } as MdxJsxFlowElement;

    // 속성 추가
    node.attributes = [
      {
        type: "mdxJsxAttribute",
        name: "type",
        value: "info",
      },
      {
        type: "mdxJsxAttribute",
        name: "id",
        value: "important-hint",
      },
      {
        type: "mdxJsxAttribute",
        name: "custom",
        value: "value",
      },
    ];

    // Mock transformRecursively 함수 생성
    const mockTransformRecursively = vi.fn((ast: Node) => ({
      ast,
      unhandledTags: new Set<string>(),
    }));

    // handleHintComponent 함수 실행
    const result = handleHintComponent(node, mockTransformRecursively);

    // 결과 검증
    expect(result.ast).toEqual({
      type: "root",
      children: [
        {
          type: "html",
          value:
            '<div class="hint hint-info" data-id="important-hint" data-custom="value">',
        },

        {
          type: "paragraph",
          children: [{ type: "text", value: "중요 정보입니다." }],
        },
        {
          type: "html",
          value: "</div>",
        },
      ],
    });
    expect(result.unhandledTags.size).toBe(0);
  });

  it("자식 노드가 없는 경우에도 정상적으로 처리한다", () => {
    // 테스트용 Hint 노드 생성 (자식 노드 없음)
    const node = {
      type: "mdxJsxFlowElement",
      name: "Hint",
    } as MdxJsxFlowElement;

    // 속성 추가
    node.attributes = [
      {
        type: "mdxJsxAttribute",
        name: "type",
        value: "note",
      },
    ];

    // Mock transformRecursively 함수 생성
    const mockTransformRecursively = vi.fn((ast: Node) => ({
      ast,
      unhandledTags: new Set<string>(),
    }));

    // handleHintComponent 함수 실행
    const result = handleHintComponent(node, mockTransformRecursively);

    // 결과 검증
    expect(result.ast).toEqual({
      type: "root",
      children: [
        {
          type: "html",
          value: '<div class="hint hint-note">',
        },
        {
          type: "html",
          value: "</div>",
        },
      ],
    });
    expect(result.unhandledTags.size).toBe(0);
  });

  it("unhandledTags를 올바르게 수집한다", () => {
    // 테스트용 Hint 노드 생성
    const node = {
      type: "mdxJsxFlowElement",
      name: "Hint",
      attributes: [],
      children: [
        { type: "text", value: "텍스트" },
        {
          type: "mdxJsxFlowElement",
          name: "CustomComponent",
          attributes: [],
          children: [],
        },
      ],
    } as MdxJsxFlowElement;

    // Mock transformRecursively 함수 생성
    const mockTransformRecursively = vi
      .fn()
      .mockImplementationOnce((ast: Node) => ({
        ast,
        unhandledTags: new Set<string>(),
      }))
      .mockImplementationOnce((ast: Node) => ({
        ast,
        unhandledTags: new Set(["CustomComponent"]),
      }));

    // handleHintComponent 함수 실행
    const result = handleHintComponent(node, mockTransformRecursively);

    // 결과 검증
    expect(result.unhandledTags.size).toBe(1);
    expect(result.unhandledTags.has("CustomComponent")).toBe(true);
    expect(mockTransformRecursively).toHaveBeenCalledTimes(2);
  });
});
