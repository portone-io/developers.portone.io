import type { MdxJsxFlowElement } from "mdast-util-mdx";
import type { Parent } from "unist";
import { visit } from "unist-util-visit";
import { describe, expect, it } from "vitest";

import { handleFigureComponent } from "./figure";

describe("handleFigureComponent", () => {
  it("캡션이 있는 경우 '(이미지 첨부: {caption})' 형태로 변환한다", () => {
    // 테스트용 노드 생성
    const node = {
      type: "mdxJsxFlowElement",
      name: "Figure",
      attributes: [
        { type: "mdxJsxAttribute", name: "caption", value: "테스트 이미지" },
      ],
      children: [],
    } as MdxJsxFlowElement;

    // handleFigureComponent 함수 실행
    const result = handleFigureComponent(node);

    // 결과 검증
    expect(result).toEqual({
      type: "paragraph",
      children: [
        {
          type: "text",
          value: "(이미지 첨부: 테스트 이미지)",
        },
      ],
    });
  });

  it("캡션이 없는 경우 '(관련 이미지 첨부)' 형태로 변환한다", () => {
    // 테스트용 노드 생성
    const node = {
      type: "mdxJsxFlowElement",
      name: "Figure",
      attributes: [
        { type: "mdxJsxAttribute", name: "src", value: "image2.png" },
      ],
      children: [],
    } as MdxJsxFlowElement;

    // handleFigureComponent 함수 실행
    const result = handleFigureComponent(node);

    // 결과 검증
    expect(result).toEqual({
      type: "paragraph",
      children: [
        {
          type: "text",
          value: "(관련 이미지 첨부)",
        },
      ],
    });
  });

  it("속성이 없는 경우에도 정상적으로 처리한다", () => {
    // 테스트용 노드 생성
    const node = {
      type: "mdxJsxFlowElement",
      name: "Figure",
      attributes: [],
      children: [],
    } as MdxJsxFlowElement;

    // handleFigureComponent 함수 실행
    const result = handleFigureComponent(node);

    // 결과 검증
    expect(result).toEqual({
      type: "paragraph",
      children: [
        {
          type: "text",
          value: "(관련 이미지 첨부)",
        },
      ],
    });
  });

  it("실제 AST 변환 과정에서 정상적으로 동작하는지 테스트", () => {
    // 테스트용 AST 생성
    const ast = {
      type: "root",
      children: [
        {
          type: "mdxJsxFlowElement",
          name: "Figure",
          attributes: [
            {
              type: "mdxJsxAttribute",
              name: "src",
              value: "image1.png",
            },
            {
              type: "mdxJsxAttribute",
              name: "caption",
              value: "테스트 이미지",
            },
          ],
        },
      ],
    };

    // AST 변환 함수 (transformJsxComponents 함수의 일부 로직)
    visit(
      ast,
      "mdxJsxFlowElement",
      (node: MdxJsxFlowElement, index, parent: Parent) => {
        if (node.name === "Figure" && index !== undefined) {
          // Figure 컴포넌트 처리
          const replacementNode = handleFigureComponent(node);

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
          type: "paragraph",
          children: [
            {
              type: "text",
              value: "(이미지 첨부: 테스트 이미지)",
            },
          ],
        },
      ],
    });
  });
});
