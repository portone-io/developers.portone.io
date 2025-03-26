import type { Html, Root } from "mdast";
import type { MdxJsxFlowElement, MdxJsxTextElement } from "mdast-util-mdx";
import type { Node } from "unist";

import { extractMdxJsxAttributes } from "./common";

/**
 * Section 컴포넌트를 HTML 주석으로 변환하는 함수
 * 시작과 끝에 "SECTION {section} START", "SECTION {section} END" 형태의 HTML 주석을 추가합니다.
 *
 * @param node Section 컴포넌트 노드
 * @param transformRecursively 내부 JSX 컴포넌트를 재귀적으로 변환하는 함수
 * @returns 변환된 노드
 */
export function handleSectionComponent(
  node: MdxJsxFlowElement | MdxJsxTextElement,
  transformRecursively: (ast: Node) => {
    ast: Node;
    unhandledTags: Set<string>;
  },
): { ast: Root; unhandledTags: Set<string> } {
  // Section 속성 추출
  const attrs = extractMdxJsxAttributes(node);
  const sectionName =
    attrs.section && typeof attrs.section === "string"
      ? attrs.section
      : "unnamed";

  // HTML 주석 시작 태그
  const sectionStartTag = {
    type: "html",
    value: `<!-- SECTION ${sectionName} START -->`,
  } as Html;

  // HTML 주석 종료 태그
  const sectionEndTag = {
    type: "html",
    value: `<!-- SECTION ${sectionName} END -->`,
  } as Html;

  // 자식 노드 재귀적으로 변환
  const results = node.children.map(transformRecursively);
  const newChildren = results.map((r) => r.ast);
  const unhandledTags = results.reduce(
    (acc, r) => acc.union(r.unhandledTags),
    new Set<string>(),
  );

  return {
    ast: {
      type: "root",
      children: [sectionStartTag, ...newChildren, sectionEndTag],
    } as Root,
    unhandledTags,
  };
}
