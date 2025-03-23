import type { Link, Paragraph, Text } from "mdast";
import type { MdxJsxFlowElement, MdxJsxTextElement } from "mdast-util-mdx";

import { extractMdxJsxAttributes } from "./common";

/**
 * <img> 태그를 마크다운 링크로 변환하는 함수
 *
 * @param jsxNode img 태그 노드
 * @returns 변환된 마크다운 형식의 링크를 담은 paragraph 노드
 */
export function handleImgTag(
  jsxNode: MdxJsxFlowElement | MdxJsxTextElement,
): Paragraph {
  // 속성 추출
  const attributes = extractMdxJsxAttributes(jsxNode);

  // src 및 alt 속성 가져오기
  const src = (attributes.src || "") as string;
  const alt = (attributes.alt || "이미지 링크") as string;

  // src가 http로 시작하지 않으면 기본 도메인 추가
  const formattedSrc =
    !src.startsWith("http://") && !src.startsWith("https://")
      ? `https://developers.portone.io${src.startsWith("/") ? "" : "/"}${src}`
      : src;

  // alt 텍스트 노드 생성
  const textNode: Text = {
    type: "text",
    value: alt,
  };

  // MDAST 링크 노드 생성
  const linkNode: Link = {
    type: "link",
    url: formattedSrc,
    title: null,
    children: [textNode],
  };

  // paragraph 노드로 감싸서 반환
  return {
    type: "paragraph",
    children: [linkNode],
  };
}
