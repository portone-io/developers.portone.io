import type { MdxJsxFlowElement } from "mdast-util-mdx";
import { describe, expect, it } from "vitest";

import { handleYoutubeComponent } from "./youtube";

describe("handleYoutubeComponent", () => {
  it("videoId와 caption이 있는 경우 caption을 텍스트로 하는 YouTube 링크를 생성한다", () => {
    // 테스트용 노드 생성
    const node = {
      type: "mdxJsxFlowElement",
      name: "Youtube",
      attributes: [
        { type: "mdxJsxAttribute", name: "videoId", value: "test123" },
        { type: "mdxJsxAttribute", name: "caption", value: "테스트 영상" },
      ],
      children: [],
    } as MdxJsxFlowElement;

    // handleYoutubeComponent 함수 실행
    const result = handleYoutubeComponent(node);

    // 결과 검증
    expect(result).toEqual({
      type: "paragraph",
      children: [
        {
          type: "link",
          url: "https://www.youtube.com/watch?v=test123",
          children: [{ type: "text", value: "테스트 영상" }],
        },
      ],
    });
  });

  it("caption이 없는 경우 기본 텍스트로 YouTube 링크를 생성한다", () => {
    // 테스트용 노드 생성 (caption 없음)
    const node = {
      type: "mdxJsxFlowElement",
      name: "Youtube",
      attributes: [
        { type: "mdxJsxAttribute", name: "videoId", value: "test456" },
      ],
      children: [],
    } as MdxJsxFlowElement;

    // handleYoutubeComponent 함수 실행
    const result = handleYoutubeComponent(node);

    // 결과 검증
    expect(result).toEqual({
      type: "paragraph",
      children: [
        {
          type: "link",
          url: "https://www.youtube.com/watch?v=test456",
          children: [{ type: "text", value: "YouTube 비디오" }],
        },
      ],
    });
  });
});
