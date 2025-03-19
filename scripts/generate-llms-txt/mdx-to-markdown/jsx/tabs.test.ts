import type { MdxJsxFlowElement } from "mdast-util-mdx";
import type { Node } from "unist";
import { describe, expect, it } from "vitest";

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

    // 목 transformJsxComponentsFn 함수 생성
    const mockTransformJsxComponentsFn = (_ast: Node) => {
      // 테스트에서는 아무 작업도 하지 않음
    };

    // handleTabsComponent 함수 실행
    const result = handleTabsComponent(node, mockTransformJsxComponentsFn);

    // 결과 검증
    expect(result).toEqual({
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
  });

  it("자식 노드가 없는 Tabs 컴포넌트도 정상적으로 처리한다", () => {
    // 테스트용 Tabs 노드 생성 (자식 노드 없음)
    const node = {
      type: "mdxJsxFlowElement",
      name: "Tabs",
      attributes: [],
      children: [],
    } as MdxJsxFlowElement;

    // 목 transformJsxComponentsFn 함수 생성
    const mockTransformJsxComponentsFn = (_ast: Node) => {
      // 테스트에서는 아무 작업도 하지 않음
    };

    // handleTabsComponent 함수 실행
    const result = handleTabsComponent(node, mockTransformJsxComponentsFn);

    // 결과 검증
    expect(result).toEqual({
      type: "root",
      children: [
        { type: "html", value: '<div class="tabs-container">' },
        { type: "html", value: "</div>" },
      ],
    });
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

    // 목 transformJsxComponentsFn 함수 생성
    const mockTransformJsxComponentsFn = (_ast: Node) => {
      // 테스트에서는 아무 작업도 하지 않음
    };

    // props 객체 생성
    const props = { title: "테스트 탭" };

    // handleTabComponent 함수 실행
    const result = handleTabComponent(
      node,
      props,
      mockTransformJsxComponentsFn,
    );

    // 결과 검증
    expect(result).toEqual({
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

    // 목 transformJsxComponentsFn 함수 생성
    const mockTransformJsxComponentsFn = (_ast: Node) => {
      // 테스트에서는 아무 작업도 하지 않음
    };

    // 빈 props 객체 생성
    const props = {};

    // handleTabComponent 함수 실행
    const result = handleTabComponent(
      node,
      props,
      mockTransformJsxComponentsFn,
    );

    // 결과 검증
    expect(result).toEqual({
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
  });

  it("자식 노드가 없는 Tab도 정상적으로 처리한다", () => {
    // 테스트용 Tab 노드 생성 (자식 노드 없음)
    const node = {
      type: "mdxJsxFlowElement",
      name: "Tabs.Tab",
      attributes: [],
      children: [],
    } as MdxJsxFlowElement;

    // 목 transformJsxComponentsFn 함수 생성
    const mockTransformJsxComponentsFn = (_ast: Node) => {
      // 테스트에서는 아무 작업도 하지 않음
    };

    // props 객체 생성
    const props = { title: "빈 탭" };

    // handleTabComponent 함수 실행
    const result = handleTabComponent(
      node,
      props,
      mockTransformJsxComponentsFn,
    );

    // 결과 검증
    expect(result).toEqual({
      type: "root",
      children: [
        {
          type: "html",
          value: '<div class="tabs-content" data-title="빈 탭">',
        },
        { type: "html", value: "</div>" },
      ],
    });
  });
});
