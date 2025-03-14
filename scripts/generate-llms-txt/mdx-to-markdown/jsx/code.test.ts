import { describe, expect, it } from "vitest";

import { extractCodeContent } from "./code";

describe("extractCodeContent", () => {
  it("자식 노드의 텍스트 내용을 결합하여 inlineCode 노드를 생성한다", () => {
    // 테스트용 코드 컴포넌트 노드 생성
    const node = {
      type: "mdxJsxFlowElement",
      name: "code",
      children: [
        {
          type: "text",
          value: "const example = ",
        },
        {
          type: "text",
          value: "'Hello World';",
        },
      ],
    };

    // extractCodeContent 함수 실행
    const result = extractCodeContent(node);

    // 결과 검증
    expect(result).toEqual({
      type: "inlineCode",
      value: "const example = 'Hello World';",
    });
  });

  it("자식 노드가 없는 경우 빈 문자열을 값으로 갖는 inlineCode 노드를 생성한다", () => {
    // 자식 노드가 없는 코드 컴포넌트 노드 생성
    const node = {
      type: "mdxJsxFlowElement",
      name: "code",
      children: [],
    };

    // extractCodeContent 함수 실행
    const result = extractCodeContent(node);

    // 결과 검증
    expect(result).toEqual({
      type: "inlineCode",
      value: "",
    });
  });

  it("다양한 타입의 자식 노드가 있는 경우에도 정상적으로 처리한다", () => {
    // 다양한 타입의 자식 노드를 가진 코드 컴포넌트 노드 생성
    const node = {
      type: "mdxJsxFlowElement",
      name: "code",
      children: [
        {
          type: "text",
          value: "function test() {\n",
        },
        {
          type: "text",
          value: "  return 'test';\n",
        },
        {
          type: "text",
          value: "}\n",
        },
      ],
    };

    // extractCodeContent 함수 실행
    const result = extractCodeContent(node);

    // 결과 검증
    expect(result).toEqual({
      type: "inlineCode",
      value: "function test() {\n  return 'test';\n}\n",
    });
  });
});
