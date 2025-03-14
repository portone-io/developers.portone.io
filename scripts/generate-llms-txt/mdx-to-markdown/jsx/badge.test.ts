import { visit } from "unist-util-visit";
import { describe, expect, it } from "vitest";

import { handleBadgeComponent } from "./badge";

describe("handleBadgeComponent", () => {
  it("PaymentV1 뱃지를 볼드 텍스트로 변환한다", () => {
    // 테스트용 PaymentV1 노드 생성
    const node = {
      type: "mdxJsxFlowElement",
      name: "PaymentV1",
    };

    // handleBadgeComponent 함수 실행
    const result = handleBadgeComponent(node, "PaymentV1");

    // 결과 검증
    expect(result).toEqual({
      type: "paragraph",
      children: [
        {
          type: "strong",
          children: [
            {
              type: "text",
              value: "결제 모듈 V1",
            },
          ],
        },
      ],
    });
  });

  it("PaymentV2 뱃지를 볼드 텍스트로 변환한다", () => {
    // 테스트용 PaymentV2 노드 생성
    const node = {
      type: "mdxJsxFlowElement",
      name: "PaymentV2",
    };

    // handleBadgeComponent 함수 실행
    const result = handleBadgeComponent(node, "PaymentV2");

    // 결과 검증
    expect(result).toEqual({
      type: "paragraph",
      children: [
        {
          type: "strong",
          children: [
            {
              type: "text",
              value: "결제 모듈 V2",
            },
          ],
        },
      ],
    });
  });

  it("Recon 뱃지를 볼드 텍스트로 변환한다", () => {
    // 테스트용 Recon 노드 생성
    const node = {
      type: "mdxJsxFlowElement",
      name: "Recon",
    };

    // handleBadgeComponent 함수 실행
    const result = handleBadgeComponent(node, "Recon");

    // 결과 검증
    expect(result).toEqual({
      type: "paragraph",
      children: [
        {
          type: "strong",
          children: [
            {
              type: "text",
              value: "PG 거래대사",
            },
          ],
        },
      ],
    });
  });

  it("Console 뱃지를 볼드 텍스트로 변환한다", () => {
    // 테스트용 Console 노드 생성
    const node = {
      type: "mdxJsxFlowElement",
      name: "Console",
    };

    // handleBadgeComponent 함수 실행
    const result = handleBadgeComponent(node, "Console");

    // 결과 검증
    expect(result).toEqual({
      type: "paragraph",
      children: [
        {
          type: "strong",
          children: [
            {
              type: "text",
              value: "관리자 콘솔",
            },
          ],
        },
      ],
    });
  });

  it("Partner 뱃지를 볼드 텍스트로 변환한다", () => {
    // 테스트용 Partner 노드 생성
    const node = {
      type: "mdxJsxFlowElement",
      name: "Partner",
    };

    // handleBadgeComponent 함수 실행
    const result = handleBadgeComponent(node, "Partner");

    // 결과 검증
    expect(result).toEqual({
      type: "paragraph",
      children: [
        {
          type: "strong",
          children: [
            {
              type: "text",
              value: "파트너 정산 자동화",
            },
          ],
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
          name: "PaymentV1",
        },
        {
          type: "mdxJsxFlowElement",
          name: "PaymentV2",
        },
        {
          type: "mdxJsxFlowElement",
          name: "Recon",
        },
      ],
    };

    // AST 변환 함수 (transformJsxComponents 함수의 일부 로직)
    visit(
      ast,
      ["mdxJsxFlowElement"],
      (node: any, index: number | undefined, parent: any) => {
        if (
          ["PaymentV1", "PaymentV2", "Recon", "Console", "Partner"].includes(
            node.name,
          ) &&
          index !== undefined
        ) {
          // Badge 컴포넌트 처리
          const replacementNode = handleBadgeComponent(node, node.name);

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
              type: "strong",
              children: [
                {
                  type: "text",
                  value: "결제 모듈 V1",
                },
              ],
            },
          ],
        },
        {
          type: "paragraph",
          children: [
            {
              type: "strong",
              children: [
                {
                  type: "text",
                  value: "결제 모듈 V2",
                },
              ],
            },
          ],
        },
        {
          type: "paragraph",
          children: [
            {
              type: "strong",
              children: [
                {
                  type: "text",
                  value: "PG 거래대사",
                },
              ],
            },
          ],
        },
      ],
    });
  });
});
