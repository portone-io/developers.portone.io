import type { MdxJsxFlowElement } from "mdast-util-mdx";
import type { Node } from "unist";
import { visit } from "unist-util-visit";
import { describe, expect, it } from "vitest";

import { handleVersionGateComponent } from "./versionGate";

describe("handleVersionGateComponent", () => {
  it("v 속성이 있는 경우 주석 스타일 박스로 내용을 감싼다", () => {
    // 테스트용 노드 생성
    const node = {
      type: "mdxJsxFlowElement",
      name: "VersionGate",
      children: [
        {
          type: "paragraph",
          children: [{ type: "text", value: "V2에서 보여질 내용" }],
        },
      ],
    } as unknown as MdxJsxFlowElement;

    // 목 함수 생성 (transformJsxComponentsFn)
    const mockTransformFn = (_ast: Node) => {
      // 테스트에서는 아무 작업도 하지 않음
    };

    // handleVersionGateComponent 함수 실행
    const result = handleVersionGateComponent(
      node,
      { v: "v2" },
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
              value: "<!-- VERSION-SPECIFIC: V2 ONLY CONTENT START -->",
            },
          ],
        },
        {
          type: "paragraph",
          children: [{ type: "text", value: "V2에서 보여질 내용" }],
        },
        {
          type: "paragraph",
          children: [
            {
              type: "html",
              value: "<!-- VERSION-SPECIFIC: V2 ONLY CONTENT END -->",
            },
          ],
        },
      ],
    });
  });

  it("v 속성이 없는 경우 원본 내용만 반환한다", () => {
    // 테스트용 VersionGate 노드 생성
    const node = {
      type: "mdxJsxFlowElement",
      name: "VersionGate",
      children: [
        {
          type: "paragraph",
          children: [{ type: "text", value: "일반 내용" }],
        },
      ],
    } as MdxJsxFlowElement;

    // 목 함수 생성 (transformJsxComponentsFn)
    const mockTransformFn = (_ast: Node) => {
      // 테스트에서는 아무 작업도 하지 않음
    };

    // handleVersionGateComponent 함수 실행 (v 속성 없음)
    const result = handleVersionGateComponent(node, {}, mockTransformFn);

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
  });

  it("실제 AST 변환 과정에서 정상적으로 동작하는지 테스트", () => {
    // 테스트용 AST 생성
    const ast = {
      type: "root",
      children: [
        {
          type: "mdxJsxFlowElement",
          name: "VersionGate",
          attributes: [{ type: "mdxJsxAttribute", name: "v", value: "v2" }],
          children: [
            {
              type: "paragraph",
              children: [{ type: "text", value: "V2에서 보여질 내용" }],
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
        if (node.name === "VersionGate" && index !== undefined) {
          // 속성 추출
          const props: Record<string, any> = {};
          if (node.attributes && Array.isArray(node.attributes)) {
            for (const attr of node.attributes) {
              if (attr.name && attr.value !== undefined) {
                props[attr.name] = attr.value;
              }
            }
          }

          // VersionGate 컴포넌트 처리
          const replacementNode = handleVersionGateComponent(
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
                  value: "<!-- VERSION-SPECIFIC: V2 ONLY CONTENT START -->",
                },
              ],
            },
            {
              type: "paragraph",
              children: [{ type: "text", value: "V2에서 보여질 내용" }],
            },
            {
              type: "paragraph",
              children: [
                {
                  type: "html",
                  value: "<!-- VERSION-SPECIFIC: V2 ONLY CONTENT END -->",
                },
              ],
            },
          ],
        },
      ],
    });
  });
});
