import type { Root } from "mdast";
import type { MdxJsxFlowElement, MdxJsxTextElement } from "mdast-util-mdx";
import type { Node } from "unist";

import { extractMdxJsxAttributes } from "./common.ts";

/**
 * Tabs 컴포넌트 처리
 * @param node Tabs 컴포넌트 노드
 * @param transformRecursively 내부 JSX 컴포넌트를 재귀적으로 변환하는 함수
 * @returns 변환된 노드
 */
export function handleTabsComponent(
  node: MdxJsxFlowElement | MdxJsxTextElement,
  transformRecursively: (ast: Node) => {
    ast: Node;
    unhandledTags: Set<string>;
  },
): { ast: Node; unhandledTags: Set<string> } {
  // 탭 컴포넌트 전체를 감싸는 div 시작 태그
  const tabsStartDiv = {
    type: "html",
    value: `<div class="tabs-container">`,
  };

  // 탭 컴포넌트 전체를 감싸는 div 종료 태그
  const tabsEndDiv = {
    type: "html",
    value: "</div>",
  };

  // 탭 내부 자식 노드들을 재귀적으로 처리
  const results = node.children.map(transformRecursively);
  const newChildren = results.map((r) => r.ast);
  const unhandledTags = results.reduce(
    (acc, r) => acc.union(r.unhandledTags),
    new Set<string>(),
  );

  const resultNodes = [tabsStartDiv, ...newChildren, tabsEndDiv];

  return {
    ast: {
      type: "root",
      children: resultNodes,
    } as Root,
    unhandledTags,
  };
}

/**
 * 개별 Tab 컴포넌트 처리
 * @param node Tab 컴포넌트 노드
 * @param transformRecursively 내부 JSX 컴포넌트를 재귀적으로 변환하는 함수
 * @returns 변환된 노드
 */
export function handleTabComponent(
  node: MdxJsxFlowElement | MdxJsxTextElement,
  transformRecursively: (ast: Node) => {
    ast: Node;
    unhandledTags: Set<string>;
  },
): { ast: Root; unhandledTags: Set<string> } {
  const props = extractMdxJsxAttributes(node);

  // 탭 속성 추출
  const title = typeof props.title === "string" ? props.title : "탭";

  // 탭 콘텐츠 시작 태그
  const tabContentStartDiv = {
    type: "html",
    value: `<div class="tabs-content" data-title="${title}">`,
  };

  // 탭 콘텐츠 종료 태그
  const tabContentEndDiv = {
    type: "html",
    value: "</div>",
  };

  // 탭 내부 자식 노드들을 재귀적으로 처리
  const results = node.children.map(transformRecursively);
  const newChildren = results.map((r) => r.ast);
  const unhandledTags = results.reduce(
    (acc, r) => acc.union(r.unhandledTags),
    new Set<string>(),
  );

  // 탭 콘텐츠 종료 태그 추가
  const resultNodes = [tabContentStartDiv, ...newChildren, tabContentEndDiv];

  return {
    ast: {
      type: "root",
      children: resultNodes,
    } as Root,
    unhandledTags,
  };
}
