import { describe, expect, it } from "vitest";

import { handleTabsComponent } from "./tabs";

describe("handleTabsComponent", () => {
  it("여러 탭이 있는 Tabs 컴포넌트를 HTML div로 변환한다", () => {
    // 테스트용 Tabs 노드 생성
    const node = {
      type: "mdxJsxFlowElement",
      name: "Tabs",
      children: [
        {
          type: "mdxJsxFlowElement",
          name: "Tabs.Tab",
          attributes: [
            { type: "mdxJsxAttribute", name: "title", value: "탭1" },
          ],
          children: [
            {
              type: "paragraph",
              children: [{ type: "text", value: "첫 번째 탭 내용" }],
            },
          ],
        },
        {
          type: "mdxJsxFlowElement",
          name: "Tabs.Tab",
          attributes: [
            { type: "mdxJsxAttribute", name: "title", value: "탭2" },
          ],
          children: [
            {
              type: "paragraph",
              children: [{ type: "text", value: "두 번째 탭 내용" }],
            },
          ],
        },
      ],
    };

    // handleTabsComponent 함수 실행
    const result = handleTabsComponent(node, {});

    // 결과 검증
    expect(result).toEqual({
      type: "root",
      children: [
        { type: "html", value: '<div class="tabs-container">' },
        { type: "html", value: '<div class="tabs-content" data-title="탭1">' },
        {
          type: "paragraph",
          children: [{ type: "text", value: "첫 번째 탭 내용" }],
        },
        { type: "html", value: "</div>" },
        { type: "html", value: '<div class="tabs-content" data-title="탭2">' },
        {
          type: "paragraph",
          children: [{ type: "text", value: "두 번째 탭 내용" }],
        },
        { type: "html", value: "</div>" },
        { type: "html", value: "</div>" },
      ],
    });
  });

  it("탭 제목이 없는 경우 기본 제목을 사용한다", () => {
    // 테스트용 Tabs 노드 생성 (탭 제목 없음)
    const node = {
      type: "mdxJsxFlowElement",
      name: "Tabs",
      children: [
        {
          type: "mdxJsxFlowElement",
          name: "Tabs.Tab",
          children: [
            {
              type: "paragraph",
              children: [{ type: "text", value: "탭 내용" }],
            },
          ],
        },
      ],
    };

    // handleTabsComponent 함수 실행
    const result = handleTabsComponent(node, {});

    // 결과 검증
    expect(result).toEqual({
      type: "root",
      children: [
        { type: "html", value: '<div class="tabs-container">' },
        { type: "html", value: '<div class="tabs-content" data-title="탭">' },
        {
          type: "paragraph",
          children: [{ type: "text", value: "탭 내용" }],
        },
        { type: "html", value: "</div>" },
        { type: "html", value: "</div>" },
      ],
    });
  });

  it("자식 노드가 없는 탭도 정상적으로 처리한다", () => {
    // 테스트용 Tabs 노드 생성 (자식 노드 없는 탭)
    const node = {
      type: "mdxJsxFlowElement",
      name: "Tabs",
      children: [
        {
          type: "mdxJsxFlowElement",
          name: "Tabs.Tab",
          attributes: [
            { type: "mdxJsxAttribute", name: "title", value: "빈 탭" },
          ],
        },
      ],
    };

    // handleTabsComponent 함수 실행
    const result = handleTabsComponent(node, {});

    // 결과 검증
    expect(result).toEqual({
      type: "root",
      children: [
        { type: "html", value: '<div class="tabs-container">' },
        {
          type: "html",
          value: '<div class="tabs-content" data-title="빈 탭">',
        },
        { type: "html", value: "</div>" },
        { type: "html", value: "</div>" },
      ],
    });
  });
});
