import type { MdxJsxFlowElement } from "mdast-util-mdx";
import type { Node, Parent } from "unist";
import { visit } from "unist-util-visit";
import { describe, expect, it, vi } from "vitest";

import { handleConditionComponent } from "./condition";

describe("handleConditionComponent", () => {
  it("if 속성이 있는 경우 주석 스타일 박스로 내용을 감싼다", () => {
    // 테스트용 노드 생성
    const node = {
      type: "mdxJsxFlowElement",
      name: "Condition",
      attributes: [{ type: "mdxJsxAttribute", name: "if", value: "browser" }],
      children: [
        {
          type: "paragraph",
          children: [{ type: "text", value: "브라우저에서만 보여질 내용" }],
        },
      ],
    } as unknown as MdxJsxFlowElement;

    // 목 함수 생성 (transformRecursively)
    const mockTransformRecursively = vi
      .fn()
      .mockImplementation((ast: Node) => ({
        ast,
        unhandledTags: new Set<string>(),
      }));

    // handleConditionComponent 함수 실행
    const result = handleConditionComponent(node, mockTransformRecursively);

    // 결과 검증
    expect(result.ast).toEqual({
      type: "root",
      children: [
        {
          type: "paragraph",
          children: [
            {
              type: "html",
              value: "<!-- CONDITIONAL CONTENT if=browser START -->",
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
              value: "<!-- CONDITIONAL CONTENT if=browser END -->",
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
      attributes: [{ type: "mdxJsxAttribute", name: "when", value: "future" }],
      children: [
        {
          type: "paragraph",
          children: [{ type: "text", value: "미래에 보여질 내용" }],
        },
      ],
    } as unknown as MdxJsxFlowElement;

    // 목 함수 생성 (transformRecursively)
    const mockTransformRecursively = vi
      .fn()
      .mockImplementation((ast: Node) => ({
        ast,
        unhandledTags: new Set<string>(),
      }));

    // handleConditionComponent 함수 실행
    const result = handleConditionComponent(node, mockTransformRecursively);

    // 결과 검증
    expect(result.ast).toEqual({
      type: "root",
      children: [
        {
          type: "paragraph",
          children: [
            {
              type: "html",
              value: "<!-- CONDITIONAL CONTENT when=future START -->",
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
              value: "<!-- CONDITIONAL CONTENT when=future END -->",
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
      attributes: [{ type: "mdxJsxAttribute", name: "language", value: "js" }],
      children: [
        {
          type: "paragraph",
          children: [{ type: "text", value: "자바스크립트 관련 내용" }],
        },
      ],
    } as unknown as MdxJsxFlowElement;

    // 목 함수 생성 (transformRecursively)
    const mockTransformRecursively = vi
      .fn()
      .mockImplementation((ast: Node) => ({
        ast,
        unhandledTags: new Set<string>(),
      }));

    // handleConditionComponent 함수 실행
    const result = handleConditionComponent(node, mockTransformRecursively);

    // 결과 검증
    expect(result.ast).toEqual({
      type: "root",
      children: [
        {
          type: "paragraph",
          children: [
            {
              type: "html",
              value: "<!-- CONDITIONAL CONTENT language=js START -->",
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
              value: "<!-- CONDITIONAL CONTENT language=js END -->",
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
      attributes: [{ type: "mdxJsxAttribute", name: "custom", value: "value" }],
      children: [
        {
          type: "paragraph",
          children: [{ type: "text", value: "특정 상황에서만 보여질 내용" }],
        },
      ],
    } as unknown as MdxJsxFlowElement;

    // 목 함수 생성 (transformRecursively)
    const mockTransformRecursively = vi
      .fn()
      .mockImplementation((ast: Node) => ({
        ast,
        unhandledTags: new Set<string>(),
      }));

    // handleConditionComponent 함수 실행
    const result = handleConditionComponent(node, mockTransformRecursively);

    // 결과 검증
    expect(result.ast).toEqual({
      type: "root",
      children: [
        {
          type: "paragraph",
          children: [
            {
              type: "html",
              value: "<!-- CONDITIONAL CONTENT custom=value START -->",
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
              value: "<!-- CONDITIONAL CONTENT custom=value END -->",
            },
          ],
        },
      ],
    });
  });

  it("속성이 없는 경우에도 transformRecursively 함수를 호출하고 원본 내용을 반환한다", () => {
    // 테스트용 Condition 노드 생성
    const node = {
      type: "mdxJsxFlowElement",
      name: "Condition",
      attributes: [],
      children: [
        {
          type: "paragraph",
          children: [{ type: "text", value: "일반 내용" }],
        },
      ],
    } as MdxJsxFlowElement;

    // transformRecursively 호출 여부를 확인하기 위한 목 함수
    const mockTransformRecursively = vi
      .fn()
      .mockImplementation((ast: Node) => ({
        ast,
        unhandledTags: new Set<string>(),
      }));

    // handleConditionComponent 함수 실행 (속성 없음)
    const result = handleConditionComponent(node, mockTransformRecursively);

    // 결과 검증
    expect(result.ast).toEqual({
      type: "root",
      children: [
        {
          type: "paragraph",
          children: [{ type: "text", value: "일반 내용" }],
        },
      ],
    });

    // transformRecursively가 호출되었는지 확인
    expect(mockTransformRecursively).toHaveBeenCalled();
    // unhandledTags가 비어있는지 확인
    expect(result.unhandledTags.size).toBe(0);
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

    // 목 함수 생성 (transformRecursively)
    const mockTransformRecursively = vi
      .fn()
      .mockImplementation((ast: Node) => ({
        ast,
        unhandledTags: new Set<string>(),
      }));

    // AST 변환 함수 (transformJsxComponents 함수의 일부 로직)
    visit(
      ast,
      "mdxJsxFlowElement",
      (node: MdxJsxFlowElement, index, parent: Parent) => {
        if (node.name === "Condition" && index !== undefined) {
          // Condition 컴포넌트 처리
          const result = handleConditionComponent(
            node,
            mockTransformRecursively,
          );

          // 노드 교체
          if (result && parent && Array.isArray(parent.children)) {
            parent.children[index] = result.ast;
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
                  value: "<!-- CONDITIONAL CONTENT if=browser START -->",
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
                  value: "<!-- CONDITIONAL CONTENT if=browser END -->",
                },
              ],
            },
          ],
        },
      ],
    });

    // transformRecursively가 호출되었는지 확인
    expect(mockTransformRecursively).toHaveBeenCalled();
  });
});
