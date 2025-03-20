import type { MdxJsxFlowElement } from "mdast-util-mdx";
import type { Node } from "unist";
import { visit } from "unist-util-visit";
import { describe, expect, it } from "vitest";

import { handleConditionComponent } from "./condition";

describe("handleConditionComponent", () => {
  it("if 속성이 있는 경우 주석 스타일 박스로 내용을 감싼다", () => {
    // 테스트용 노드 생성
    const node = {
      type: "mdxJsxFlowElement",
      name: "Condition",
      children: [
        {
          type: "paragraph",
          children: [{ type: "text", value: "브라우저에서만 보여질 내용" }],
        },
      ],
    } as unknown as MdxJsxFlowElement;

    // 목 함수 생성 (transformJsxComponentsFn)
    const mockTransformFn = (_ast: Node) => {
      // 테스트에서는 아무 작업도 하지 않음
    };

    // handleConditionComponent 함수 실행
    const result = handleConditionComponent(
      node,
      { if: "browser" },
      mockTransformFn,
    );

    // 결과 검증
    expect(result).toEqual({
      type: "root",
      children: [
        {
          type: "paragraph",
          children: [
            {
              type: "html",
              value: "<!-- CONDITIONAL CONTENT: if=browser START -->",
            },
          ],
        },
        {
          type: "paragraph",
          children: [{ type: "text", value: "브라우저에서만 보여질 내용" }],
        },
        {
          type: "paragraph",
          children: [
            {
              type: "html",
              value: "<!-- CONDITIONAL CONTENT: if=browser END -->",
            },
          ],
        },
      ],
    });
  });

  it("when 속성이 있는 경우 주석 스타일 박스로 내용을 감싼다", () => {
    // 테스트용 노드 생성
    const node = {
      type: "mdxJsxFlowElement",
      name: "Condition",
      children: [
        {
          type: "paragraph",
          children: [{ type: "text", value: "미래에 보여질 내용" }],
        },
      ],
    } as unknown as MdxJsxFlowElement;

    // 목 함수 생성 (transformJsxComponentsFn)
    const mockTransformFn = (_ast: Node) => {
      // 테스트에서는 아무 작업도 하지 않음
    };

    // handleConditionComponent 함수 실행
    const result = handleConditionComponent(
      node,
      { when: "future" },
      mockTransformFn,
    );

    // 결과 검증
    expect(result).toEqual({
      type: "root",
      children: [
        {
          type: "paragraph",
          children: [
            {
              type: "html",
              value: "<!-- CONDITIONAL CONTENT: when=future START -->",
            },
          ],
        },
        {
          type: "paragraph",
          children: [{ type: "text", value: "미래에 보여질 내용" }],
        },
        {
          type: "paragraph",
          children: [
            {
              type: "html",
              value: "<!-- CONDITIONAL CONTENT: when=future END -->",
            },
          ],
        },
      ],
    });
  });

  it("language 속성이 있는 경우 주석 스타일 박스로 내용을 감싼다", () => {
    // 테스트용 노드 생성
    const node = {
      type: "mdxJsxFlowElement",
      name: "Condition",
      children: [
        {
          type: "paragraph",
          children: [{ type: "text", value: "자바스크립트 관련 내용" }],
        },
      ],
    } as unknown as MdxJsxFlowElement;

    // 목 함수 생성 (transformJsxComponentsFn)
    const mockTransformFn = (_ast: Node) => {
      // 테스트에서는 아무 작업도 하지 않음
    };

    // handleConditionComponent 함수 실행
    const result = handleConditionComponent(
      node,
      { language: "js" },
      mockTransformFn,
    );

    // 결과 검증
    expect(result).toEqual({
      type: "root",
      children: [
        {
          type: "paragraph",
          children: [
            {
              type: "html",
              value: "<!-- CONDITIONAL CONTENT: language=js START -->",
            },
          ],
        },
        {
          type: "paragraph",
          children: [{ type: "text", value: "자바스크립트 관련 내용" }],
        },
        {
          type: "paragraph",
          children: [
            {
              type: "html",
              value: "<!-- CONDITIONAL CONTENT: language=js END -->",
            },
          ],
        },
      ],
    });
  });

  it("커스텀 속성이 있는 경우 주석 스타일 박스로 내용을 감싼다", () => {
    // 테스트용 노드 생성
    const node = {
      type: "mdxJsxFlowElement",
      name: "Condition",
      children: [
        {
          type: "paragraph",
          children: [{ type: "text", value: "특정 상황에서만 보여질 내용" }],
        },
      ],
    } as unknown as MdxJsxFlowElement;

    // 목 함수 생성 (transformJsxComponentsFn)
    const mockTransformFn = (_ast: Node) => {
      // 테스트에서는 아무 작업도 하지 않음
    };

    // handleConditionComponent 함수 실행
    const result = handleConditionComponent(
      node,
      { custom: "value" },
      mockTransformFn,
    );

    // 결과 검증
    expect(result).toEqual({
      type: "root",
      children: [
        {
          type: "paragraph",
          children: [
            {
              type: "html",
              value: "<!-- CONDITIONAL CONTENT: custom=value START -->",
            },
          ],
        },
        {
          type: "paragraph",
          children: [{ type: "text", value: "특정 상황에서만 보여질 내용" }],
        },
        {
          type: "paragraph",
          children: [
            {
              type: "html",
              value: "<!-- CONDITIONAL CONTENT: custom=value END -->",
            },
          ],
        },
      ],
    });
  });

  it("속성이 없는 경우에도 transformJsxComponentsFn 함수를 호출하고 원본 내용을 반환한다", () => {
    // 테스트용 Condition 노드 생성
    const node = {
      type: "mdxJsxFlowElement",
      name: "Condition",
      children: [
        {
          type: "paragraph",
          children: [{ type: "text", value: "일반 내용" }],
        },
      ],
    } as MdxJsxFlowElement;

    // transformJsxComponentsFn 호출 여부를 확인하기 위한 목 함수
    let transformCalled = false;
    const mockTransformFn = (_ast: Node) => {
      transformCalled = true;
    };

    // handleConditionComponent 함수 실행 (속성 없음)
    const result = handleConditionComponent(node, {}, mockTransformFn);

    // 결과 검증
    expect(result).toEqual({
      type: "root",
      children: [
        {
          type: "paragraph",
          children: [{ type: "text", value: "일반 내용" }],
        },
      ],
    });

    // transformJsxComponentsFn가 호출되었는지 확인
    expect(transformCalled).toBe(true);
  });

  it("실제 AST 변환 과정에서 정상적으로 동작하는지 테스트", () => {
    // 테스트용 AST 생성
    const ast = {
      type: "root",
      children: [
        {
          type: "mdxJsxFlowElement",
          name: "Condition",
          attributes: [
            { type: "mdxJsxAttribute", name: "if", value: "browser" },
          ],
          children: [
            {
              type: "paragraph",
              children: [{ type: "text", value: "브라우저에서만 보여질 내용" }],
            },
          ],
        },
      ],
    };

    // 목 함수 생성 (transformJsxComponentsFn)
    const mockTransformFn = (_ast: Node) => {
      // 테스트에서는 아무 작업도 하지 않음
    };

    // AST 변환 함수 (transformJsxComponents 함수의 일부 로직)
    visit(
      ast,
      ["mdxJsxFlowElement"],
      (node: any, index: number | undefined, parent: any) => {
        if (node.name === "Condition" && index !== undefined) {
          // 속성 추출
          const props: Record<string, any> = {};
          if (node.attributes && Array.isArray(node.attributes)) {
            for (const attr of node.attributes) {
              if (attr.name && attr.value !== undefined) {
                props[attr.name] = attr.value;
              }
            }
          }

          // Condition 컴포넌트 처리
          const replacementNode = handleConditionComponent(
            node,
            props,
            mockTransformFn,
          );

          // 노드 교체
          if (replacementNode && parent && Array.isArray(parent.children)) {
            parent.children[index] = replacementNode;
          }
        }
      },
    );

    // 결과 검증
    expect(ast).toEqual({
      type: "root",
      children: [
        {
          type: "root",
          children: [
            {
              type: "paragraph",
              children: [
                {
                  type: "html",
                  value: "<!-- CONDITIONAL CONTENT: if=browser START -->",
                },
              ],
            },
            {
              type: "paragraph",
              children: [{ type: "text", value: "브라우저에서만 보여질 내용" }],
            },
            {
              type: "paragraph",
              children: [
                {
                  type: "html",
                  value: "<!-- CONDITIONAL CONTENT: if=browser END -->",
                },
              ],
            },
          ],
        },
      ],
    });
  });
});
