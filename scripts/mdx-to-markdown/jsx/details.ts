import type { Html, Root } from "mdast";
import type { MdxJsxFlowElement, MdxJsxTextElement } from "mdast-util-mdx";
import type { Node } from "unist";

import { unwrapJsxNode } from "./common";

/**
 * Details 컴포넌트를 HTML details 태그로 변환하는 함수
 * @param node Details 컴포넌트 노드
 * @param transformRecursively 내부 JSX 컴포넌트를 재귀적으로 변환하는 함수
 * @returns 변환된 노드
 */
export function handleDetailsComponent(
  node: MdxJsxFlowElement | MdxJsxTextElement,
  transformRecursively: (ast: Node) => {
    ast: Node;
    unhandledTags: Set<string>;
  },
): { ast: Root; unhandledTags: Set<string> } {
  // summary 시작 태그
  const detailsStartTag = {
    type: "html",
    value: "<details>",
  } as Html;

  // summary 종료 태그
  const detailsEndTag = {
    type: "html",
    value: "</details>",
  } as Html;

  const results = node.children.map(transformRecursively);

  const newChildren = results.map((r) => r.ast);
  const unhandledTags = results.reduce(
    (acc, r) => acc.union(r.unhandledTags),
    new Set<string>(),
  );

  return {
    ast: {
      type: "root",
      children: [detailsStartTag, ...newChildren, detailsEndTag],
    } as Root,
    unhandledTags,
  };
}

/**
 * Details.Summary 컴포넌트를 처리하는 함수
 * @param node Summary 컴포넌트 노드
 * @param transformRecursively 내부 JSX 컴포넌트를 재귀적으로 변환하는 함수
 * @returns 변환된 노드
 */
export function handleDetailsSummaryComponent(
  node: MdxJsxFlowElement | MdxJsxTextElement,
  transformRecursively: (ast: Node) => {
    ast: Node;
    unhandledTags: Set<string>;
  },
): { ast: Root; unhandledTags: Set<string> } {
  // summary 시작 태그
  const summaryStartTag = {
    type: "html",
    value: "<summary>",
  } as Html;

  // summary 종료 태그
  const summaryEndTag = {
    type: "html",
    value: "</summary>",
  } as Html;

  const results = node.children.map(transformRecursively);
  const newChildren = results.map((r) => r.ast);
  const unhandledTags = results.reduce(
    (acc, r) => acc.union(r.unhandledTags),
    new Set<string>(),
  );

  return {
    ast: {
      type: "root",
      children: [summaryStartTag, ...newChildren, summaryEndTag],
    } as Root,
    unhandledTags,
  };
}

/**
 * Details.Content 컴포넌트를 처리하는 함수
 * @param node Content 컴포넌트 노드
 * @param transformRecursively 내부 JSX 컴포넌트를 재귀적으로 변환하는 함수
 * @returns 변환된 노드
 */
export function handleDetailsContentComponent(
  node: MdxJsxFlowElement | MdxJsxTextElement,
  transformRecursively: (ast: Node) => {
    ast: Node;
    unhandledTags: Set<string>;
  },
): { ast: Root; unhandledTags: Set<string> } {
  return unwrapJsxNode(node, transformRecursively);
}
