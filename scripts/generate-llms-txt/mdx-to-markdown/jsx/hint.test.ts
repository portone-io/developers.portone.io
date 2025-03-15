import type { MdxJsxFlowElement } from "mdast-util-mdx";
import { describe, expect, it } from "vitest";

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

    // handleHintComponent 함수 실행
    const result = handleHintComponent(node, {});

    // 결과 검증
    expect(result).toEqual({
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

    // handleHintComponent 함수 실행 (type 속성 추가)
    const result = handleHintComponent(node, { type: "warning" });

    // 결과 검증
    expect(result).toEqual({
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

    // handleHintComponent 함수 실행 (여러 속성 추가)
    const result = handleHintComponent(node, {
      type: "info",
      id: "important-hint",
      custom: "value",
    });

    // 결과 검증
    expect(result).toEqual({
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
  });

  it("자식 노드가 없는 경우에도 정상적으로 처리한다", () => {
    // 테스트용 Hint 노드 생성 (자식 노드 없음)
    const node = {
      type: "mdxJsxFlowElement",
      name: "Hint",
    } as MdxJsxFlowElement;

    // handleHintComponent 함수 실행
    const result = handleHintComponent(node, { type: "note" });

    // 결과 검증
    expect(result).toEqual({
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
  });
});
