import type { Root } from "mdast";
import type { MdxJsxFlowElement, MdxJsxTextElement } from "mdast-util-mdx";
import type { Node } from "unist";

import { extractMdxJsxAttributes } from "./common.ts";

/**
 * Hint 컴포넌트를 HTML div로 변환하는 함수
 * @param node Hint 컴포넌트 노드
 * @param props 컴포넌트 속성
 * @param transformRecursively 내부 JSX 컴포넌트를 재귀적으로 변환하는 함수
 * @returns 변환된 노드
 */
export function handleHintComponent(
  node: MdxJsxFlowElement | MdxJsxTextElement,
  transformRecursively: (ast: Node) => {
    ast: Node;
    unhandledTags: Set<string>;
  },
): { ast: Root; unhandledTags: Set<string> } {
  const props = extractMdxJsxAttributes(node);

  // 속성 문자열 생성
  let classNames = "hint";
  let attributesStr = "";

  // 모든 속성 처리
  Object.entries(props).forEach(([key, value]) => {
    if (value !== undefined) {
      // type 속성은 클래스로 추가
      if (key === "type" && typeof value === "string") {
        classNames += ` hint-${value}`;
      } else {
        // 나머지 속성은 data-* 속성으로 추가
        const valueStr =
          typeof value === "string" ? value : JSON.stringify(value);
        attributesStr += `data-${key}="${valueStr}" `;
      }
    }
  });

  attributesStr = attributesStr.trim();

  // HTML div 시작 태그
  const hintStartDiv = {
    type: "html",
    value: `<div class="${classNames}"${attributesStr ? ` ${attributesStr}` : ""}>`,
  };

  // HTML div 종료 태그
  const hintEndDiv = {
    type: "html",
    value: "</div>",
  };

  // Handle case when node.children is undefined
  const children = node.children || [];
  const results = children.map(transformRecursively);
  const newChildren = results.map((r) => r.ast);
  const unhandledTags = results.reduce(
    (acc, r) => new Set([...acc, ...r.unhandledTags]),
    new Set<string>(),
  );

  return {
    ast: {
      type: "root",
      children: [hintStartDiv, ...newChildren, hintEndDiv],
    } as Root,
    unhandledTags,
  };
}
