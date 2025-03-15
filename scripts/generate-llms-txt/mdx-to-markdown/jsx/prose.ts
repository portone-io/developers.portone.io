import type { MdxJsxFlowElement, MdxJsxTextElement } from "mdast-util-mdx";

import { extractMdxJsxAttributes } from "./common";

/**
 * Prose 컴포넌트 처리 (prose.h1, prose.h2, prose.p 등)
 * @param node MDX JSX 노드
 * @param elementType prose 요소 타입 (h1, h2, p 등)
 * @returns 변환된 노드
 */
export function handleProseComponent(
  node: MdxJsxFlowElement | MdxJsxTextElement,
  elementType: string,
) {
  // prose 태그 내의 자식 노드들을 유지하면서 적절한 마크다운 요소로 변환
  switch (elementType) {
    case "h1":
      return {
        type: "heading",
        depth: 1,
        children: node.children || [],
      };
    case "h2":
      return {
        type: "heading",
        depth: 2,
        children: node.children || [],
      };
    case "h3":
      return {
        type: "heading",
        depth: 3,
        children: node.children || [],
      };
    case "h4":
      return {
        type: "heading",
        depth: 4,
        children: node.children || [],
      };
    case "h5":
      return {
        type: "heading",
        depth: 5,
        children: node.children || [],
      };
    case "h6":
      return {
        type: "heading",
        depth: 6,
        children: node.children || [],
      };
    case "p":
      return {
        type: "paragraph",
        children: node.children || [],
      };
    case "a": {
      // 링크 속성 추출
      const props = extractMdxJsxAttributes(node);
      return {
        type: "link",
        url: props.href || "#",
        title: props.title,
        children: node.children || [],
      };
    }
    case "blockquote":
      return {
        type: "blockquote",
        children: node.children || [],
      };
    case "ul":
      return {
        type: "list",
        ordered: false,
        spread: false,
        children: node.children || [],
      };
    default:
      // 기본적으로 자식 노드만 유지하는 paragraph로 변환
      return {
        type: "paragraph",
        children: node.children || [],
      };
  }
}
