import type { MdxJsxFlowElement } from "mdast-util-mdx";
import { describe, expect, it } from "vitest";

import { handleFileComponent } from "./file";

describe("handleFileComponent", () => {
  it("captionInside가 있는 경우 '(파일: {captionInside})' 형태로 변환한다", () => {
    // 테스트용 노드 생성
    const node = {
      type: "mdxJsxFlowElement",
      name: "File",
      attributes: [
        { type: "mdxJsxAttribute", name: "src", value: "/path/to/file.pdf" },
        {
          type: "mdxJsxAttribute",
          name: "captionInside",
          value: "파일 다운로드",
        },
      ],
      children: [],
    } as MdxJsxFlowElement;

    // handleFileComponent 함수 실행
    const result = handleFileComponent(node);

    // 결과 검증
    expect(result).toEqual({
      type: "paragraph",
      children: [
        {
          type: "text",
          value: "(파일: 파일 다운로드)",
        },
      ],
    });
  });

  it("captionInside가 없는 경우 '(파일 다운로드 링크)' 형태로 변환한다", () => {
    // 테스트용 노드 생성
    const node = {
      type: "mdxJsxFlowElement",
      name: "File",
      attributes: [
        { type: "mdxJsxAttribute", name: "src", value: "/path/to/file.pdf" },
      ],
      children: [],
    } as MdxJsxFlowElement;

    // handleFileComponent 함수 실행
    const result = handleFileComponent(node);

    // 결과 검증
    expect(result).toEqual({
      type: "paragraph",
      children: [
        {
          type: "text",
          value: "(파일 다운로드 링크)",
        },
      ],
    });
  });
});
