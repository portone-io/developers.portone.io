import type { MdxJsxFlowElement } from "mdast-util-mdx";
import type { Node } from "unist";
import { describe, expect, it, vi } from "vitest";

import { handleTabComponent, handleTabsComponent } from "./tabs";

describe("handleTabsComponent", () => {
  it("Tabs 컴포넌트를 HTML div로 변환한다", () => {
    // 테스트용 Tabs 노드 생성
    const node = {
      type: "mdxJsxFlowElement",
      name: "Tabs",
      attributes: [],
      children: [
        {
          type: "paragraph",
          children: [{ type: "text", value: "탭 컨테이너 내용" }],
        },
      ],
    } as MdxJsxFlowElement;

    // Mock transformRecursively 함수 생성
    const mockTransformRecursively = vi.fn((ast: Node) => ({
      ast,
      unhandledTags: new Set<string>(),
    }));

    // handleTabsComponent 함수 실행
    const result = handleTabsComponent(node, mockTransformRecursively);

    // 결과 검증
    expect(result.ast).toEqual({
      type: "root",
      children: [
        { type: "html", value: '<div class="tabs-container">' },
        {
          type: "paragraph",
          children: [{ type: "text", value: "탭 컨테이너 내용" }],
        },
        { type: "html", value: "</div>" },
      ],
    });
    expect(result.unhandledTags.size).toBe(0);
  });

  it("자식 노드가 없는 Tabs 컴포넌트도 정상적으로 처리한다", () => {
    // 테스트용 Tabs 노드 생성 (자식 노드 없음)
    const node = {
      type: "mdxJsxFlowElement",
      name: "Tabs",
      attributes: [],
      children: [],
    } as MdxJsxFlowElement;

    // Mock transformRecursively 함수 생성
    const mockTransformRecursively = vi.fn((ast: Node) => ({
      ast,
      unhandledTags: new Set<string>(),
    }));

    // handleTabsComponent 함수 실행
    const result = handleTabsComponent(node, mockTransformRecursively);

    // 결과 검증
    expect(result.ast).toEqual({
      type: "root",
      children: [
        { type: "html", value: '<div class="tabs-container">' },
        { type: "html", value: "</div>" },
      ],
    });
    expect(result.unhandledTags.size).toBe(0);
  });
});

describe("handleTabComponent", () => {
  it("Tab 컴포넌트를 HTML div로 변환한다", () => {
    // 테스트용 Tab 노드 생성
    const node = {
      type: "mdxJsxFlowElement",
      name: "Tabs.Tab",
      attributes: [],
      children: [
        {
          type: "paragraph",
          children: [{ type: "text", value: "탭 내용" }],
        },
      ],
    } as MdxJsxFlowElement;

    // 속성 추가
    node.attributes = [
      {
        type: "mdxJsxAttribute",
        name: "title",
        value: "테스트 탭",
      },
    ];

    // Mock transformRecursively 함수 생성
    const mockTransformRecursively = vi.fn((ast: Node) => ({
      ast,
      unhandledTags: new Set<string>(),
    }));

    // handleTabComponent 함수 실행
    const result = handleTabComponent(node, mockTransformRecursively);

    // 결과 검증
    expect(result.ast).toEqual({
      type: "root",
      children: [
        {
          type: "html",
          value: '<div class="tabs-content" data-title="테스트 탭">',
        },
        {
          type: "paragraph",
          children: [{ type: "text", value: "탭 내용" }],
        },
        { type: "html", value: "</div>" },
      ],
    });
    expect(result.unhandledTags.size).toBe(0);
  });

  it("탭 제목이 없는 경우 기본 제목을 사용한다", () => {
    // 테스트용 Tab 노드 생성
    const node = {
      type: "mdxJsxFlowElement",
      name: "Tabs.Tab",
      attributes: [],
      children: [
        {
          type: "paragraph",
          children: [{ type: "text", value: "탭 내용" }],
        },
      ],
    } as MdxJsxFlowElement;

    // 속성은 추가하지 않음 (빈 title을 테스트)
    node.attributes = [];

    // Mock transformRecursively 함수 생성
    const mockTransformRecursively = vi.fn((ast: Node) => ({
      ast,
      unhandledTags: new Set<string>(),
    }));

    // handleTabComponent 함수 실행
    const result = handleTabComponent(node, mockTransformRecursively);

    // 결과 검증
    expect(result.ast).toEqual({
      type: "root",
      children: [
        { type: "html", value: '<div class="tabs-content" data-title="탭">' },
        {
          type: "paragraph",
          children: [{ type: "text", value: "탭 내용" }],
        },
        { type: "html", value: "</div>" },
      ],
    });
    expect(result.unhandledTags.size).toBe(0);
  });

  it("자식 노드가 없는 Tab도 정상적으로 처리한다", () => {
    // 테스트용 Tab 노드 생성 (자식 노드 없음)
    const node = {
      type: "mdxJsxFlowElement",
      name: "Tabs.Tab",
      attributes: [],
      children: [],
    } as MdxJsxFlowElement;

    // 속성 추가
    node.attributes = [
      {
        type: "mdxJsxAttribute",
        name: "title",
        value: "빈 탭",
      },
    ];

    // Mock transformRecursively 함수 생성
    const mockTransformRecursively = vi.fn((ast: Node) => ({
      ast,
      unhandledTags: new Set<string>(),
    }));

    // handleTabComponent 함수 실행
    const result = handleTabComponent(node, mockTransformRecursively);

    // 결과 검증
    expect(result.ast).toEqual({
      type: "root",
      children: [
        {
          type: "html",
          value: '<div class="tabs-content" data-title="빈 탭">',
        },
        { type: "html", value: "</div>" },
      ],
    });
    expect(result.unhandledTags.size).toBe(0);
  });
});
