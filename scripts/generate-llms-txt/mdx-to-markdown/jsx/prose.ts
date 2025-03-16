import type { MdxJsxFlowElement, MdxJsxTextElement } from "mdast-util-mdx";
import type { Node } from "unist";

import { extractMdxJsxAttributes } from "./common";

/**
 * Prose 컴포넌트 처리 (prose.h1, prose.h2, prose.p 등)
 * @param node MDX JSX 노드
 * @param elementType prose 요소 타입 (h1, h2, p 등)
 * @param transformJsxComponentsFn 내부 JSX 컴포넌트를 재귀적으로 변환하는 함수
 * @returns 변환된 노드
 */
export function handleProseComponent(
  node: MdxJsxFlowElement | MdxJsxTextElement,
  elementType: string,
  transformJsxComponentsFn: (ast: Node) => void,
) {
  // 자식 노드들을 재귀적으로 처리하기 위한 임시 노드
  const childrenContent = {
    type: "root",
    children: node.children || [],
  };

  // 자식 노드들을 재귀적으로 처리
  transformJsxComponentsFn(childrenContent);

  // prose 태그 내의 처리된 자식 노드들을 적절한 마크다운 요소로 변환
  switch (elementType) {
    case "h1":
      return {
        type: "heading",
        depth: 1,
        children: childrenContent.children,
      };
    case "h2":
      return {
        type: "heading",
        depth: 2,
        children: childrenContent.children,
      };
    case "h3":
      return {
        type: "heading",
        depth: 3,
        children: childrenContent.children,
      };
    case "h4":
      return {
        type: "heading",
        depth: 4,
        children: childrenContent.children,
      };
    case "h5":
      return {
        type: "heading",
        depth: 5,
        children: childrenContent.children,
      };
    case "h6":
      return {
        type: "heading",
        depth: 6,
        children: childrenContent.children,
      };
    case "p":
      return {
        type: "paragraph",
        children: childrenContent.children,
      };
    case "a": {
      // 링크 속성 추출
      const props = extractMdxJsxAttributes(node);
      return {
        type: "link",
        url: props.href || "#",
        title: props.title,
        children: childrenContent.children,
      };
    }
    case "blockquote":
      return {
        type: "blockquote",
        children: childrenContent.children,
      };
    case "ul":
      return {
        type: "list",
        ordered: false,
        spread: false,
        children: childrenContent.children,
      };
    default:
      // 기본적으로 자식 노드만 유지하는 paragraph로 변환
      return {
        type: "paragraph",
        children: childrenContent.children,
      };
  }
}
