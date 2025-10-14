import type { Blockquote, Heading, Link, List, Paragraph } from "mdast";
import type { MdxJsxFlowElement, MdxJsxTextElement } from "mdast-util-mdx";
import type { Node } from "unist";

import { extractMdxJsxAttributes } from "./common.ts";

/**
 * Prose 컴포넌트 처리 (prose.h1, prose.h2, prose.p 등)
 * @param node MDX JSX 노드
 * @param elementType prose 요소 타입 (h1, h2, p 등)
 * @param transformRecursively 내부 JSX 컴포넌트를 재귀적으로 변환하는 함수
 * @returns 변환된 노드
 */
export function handleProseComponent(
  node: MdxJsxFlowElement | MdxJsxTextElement,
  elementType: string,
  transformRecursively: (ast: Node) => {
    ast: Node;
    unhandledTags: Set<string>;
  },
): { ast: Node; unhandledTags: Set<string> } {
  // 자식 노드들을 재귀적으로 처리하기 위한 임시 노드
  const results = (node.children || []).map(transformRecursively);

  const children = results.map((r) => r.ast);

  const unhandledTags = results.reduce(
    (acc, r) => acc.union(r.unhandledTags),
    new Set<string>(),
  );

  // prose 태그 내의 처리된 자식 노드들을 적절한 마크다운 요소로 변환
  switch (elementType) {
    case "h1":
      return {
        ast: {
          type: "heading",
          depth: 1,
          children,
        } as Heading,
        unhandledTags,
      };
    case "h2":
      return {
        ast: {
          type: "heading",
          depth: 2,
          children,
        } as Heading,
        unhandledTags,
      };
    case "h3":
      return {
        ast: {
          type: "heading",
          depth: 3,
          children,
        } as Heading,
        unhandledTags,
      };
    case "h4":
      return {
        ast: {
          type: "heading",
          depth: 4,
          children,
        } as Heading,
        unhandledTags,
      };
    case "h5":
      return {
        ast: {
          type: "heading",
          depth: 5,
          children,
        } as Heading,
        unhandledTags,
      };
    case "h6":
      return {
        ast: {
          type: "heading",
          depth: 6,
          children,
        } as Heading,
        unhandledTags,
      };
    case "p":
      return {
        ast: {
          type: "paragraph",
          children,
        } as Paragraph,
        unhandledTags,
      };
    case "a": {
      // 링크 속성 추출
      const props = extractMdxJsxAttributes(node);
      return {
        ast: {
          type: "link",
          url: props.href || "#",
          title: props.title,
          children,
        } as Link,
        unhandledTags,
      };
    }
    case "blockquote":
      return {
        ast: {
          type: "blockquote",
          children,
        } as Blockquote,
        unhandledTags,
      };
    case "ul":
      return {
        ast: {
          type: "list",
          ordered: false,
          spread: false,
          children,
        } as List,
        unhandledTags,
      };
    default:
      // 기본적으로 자식 노드만 유지하는 paragraph로 변환
      return {
        ast: {
          type: "paragraph",
          children,
        } as Paragraph,
        unhandledTags,
      };
  }
}
