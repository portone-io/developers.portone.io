import type { MdxJsxFlowElement } from "mdast-util-mdx";
import { describe, expect, it } from "vitest";

import { handleImgTag } from "./img";

describe("handleImgTag", () => {
  it("transforms img tag with src and alt to markdown link", () => {
    // 테스트용 img 태그 노드 생성
    const imgNode: MdxJsxFlowElement = {
      type: "mdxJsxFlowElement",
      name: "img",
      attributes: [
        {
          type: "mdxJsxAttribute",
          name: "src",
          value: "/some/image/link.png",
        },
        {
          type: "mdxJsxAttribute",
          name: "alt",
          value: "some description",
        },
      ],
      children: [],
    };

    // 함수 실행
    const result = handleImgTag(imgNode);

    // 결과 검증
    expect(result).toEqual({
      type: "paragraph",
      children: [
        {
          type: "link",
          url: "https://developers.portone.io/some/image/link.png",
          title: null,
          children: [
            {
              type: "text",
              value: "some description",
            },
          ],
        },
      ],
    });
  });

  it("uses default alt text when alt attribute is missing", () => {
    // alt 속성이 없는 img 태그 노드 생성
    const imgNode: MdxJsxFlowElement = {
      type: "mdxJsxFlowElement",
      name: "img",
      attributes: [
        {
          type: "mdxJsxAttribute",
          name: "src",
          value: "/some/image/link.png",
        },
      ],
      children: [],
    };

    // 함수 실행
    const result = handleImgTag(imgNode);

    // 결과 검증
    expect(result).toEqual({
      type: "paragraph",
      children: [
        {
          type: "link",
          url: "https://developers.portone.io/some/image/link.png",
          title: null,
          children: [
            {
              type: "text",
              value: "이미지 링크",
            },
          ],
        },
      ],
    });
  });

  it("adds domain to relative paths", () => {
    // 상대 경로가 있는 img 태그 노드 생성
    const imgNode: MdxJsxFlowElement = {
      type: "mdxJsxFlowElement",
      name: "img",
      attributes: [
        {
          type: "mdxJsxAttribute",
          name: "src",
          value: "some/image/link.png", // 슬래시로 시작하지 않는 경로
        },
        {
          type: "mdxJsxAttribute",
          name: "alt",
          value: "relative path image",
        },
      ],
      children: [],
    };

    // 함수 실행
    const result = handleImgTag(imgNode);

    // 결과 검증
    expect(result).toEqual({
      type: "paragraph",
      children: [
        {
          type: "link",
          url: "https://developers.portone.io/some/image/link.png",
          title: null,
          children: [
            {
              type: "text",
              value: "relative path image",
            },
          ],
        },
      ],
    });
  });

  it("preserves absolute URLs", () => {
    // 절대 URL이 있는 img 태그 노드 생성
    const imgNode: MdxJsxFlowElement = {
      type: "mdxJsxFlowElement",
      name: "img",
      attributes: [
        {
          type: "mdxJsxAttribute",
          name: "src",
          value: "https://example.com/image.png",
        },
        {
          type: "mdxJsxAttribute",
          name: "alt",
          value: "external image",
        },
      ],
      children: [],
    };

    // 함수 실행
    const result = handleImgTag(imgNode);

    // 결과 검증
    expect(result).toEqual({
      type: "paragraph",
      children: [
        {
          type: "link",
          url: "https://example.com/image.png",
          title: null,
          children: [
            {
              type: "text",
              value: "external image",
            },
          ],
        },
      ],
    });
  });
});
