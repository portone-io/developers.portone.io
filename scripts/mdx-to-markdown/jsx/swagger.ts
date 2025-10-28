import type { Root } from "mdast";
import type { MdxJsxFlowElement, MdxJsxTextElement } from "mdast-util-mdx";
import type { Node } from "unist";

import { extractMdxJsxAttributes, unwrapJsxNode } from "./common.ts";

/**
 * Swagger 컴포넌트 처리
 * @param node MDX JSX 노드
 * @param transformRecursively 내부 JSX 컴포넌트를 재귀적으로 변환하는 함수
 * @returns 변환된 마크다운 노드
 */
export function handleSwaggerComponent(
  node: MdxJsxFlowElement | MdxJsxTextElement,
  transformRecursively: (ast: Node) => {
    ast: Node;
    unhandledTags: Set<string>;
  },
): { ast: Root; unhandledTags: Set<string> } {
  const props = extractMdxJsxAttributes(node);
  const method = (
    typeof props.method === "string"
      ? props.method
      : JSON.stringify(props.method)
  ).toUpperCase();
  const baseUrl =
    typeof props.baseUrl === "string"
      ? props.baseUrl
      : JSON.stringify(props.baseUrl);
  const path =
    typeof props.path === "string" ? props.path : JSON.stringify(props.path);
  const summary =
    typeof props.summary === "string"
      ? props.summary
      : JSON.stringify(props.summary);

  // 헤더 생성 (메서드 + 경로)
  const headerNode = {
    type: "paragraph",
    children: [
      {
        type: "strong",
        children: [
          {
            type: "text",
            value: method,
          },
        ],
      },
      {
        type: "text",
        value: ` ${baseUrl}${path}`,
      },
    ],
  };

  // 요약 정보
  const summaryNode = summary
    ? {
        type: "paragraph",
        children: [
          {
            type: "emphasis",
            children: [{ type: "text", value: summary }],
          },
        ],
      }
    : undefined;

  // 자식 노드들을 재귀적으로 처리
  const results = node.children.map(transformRecursively);
  const newChildren = results.map((result) => result.ast);
  const unhandledTags = results.reduce(
    (acc, result) => acc.union(result.unhandledTags),
    new Set<string>(),
  );

  // 자식 노드들을 포함한 컨테이너 생성
  return {
    ast: {
      type: "root",
      children: [
        headerNode,
        ...(summaryNode ? [summaryNode] : []),
        ...newChildren,
      ],
    } as Root,
    unhandledTags,
  };
}

/**
 * SwaggerDescription 컴포넌트 처리
 * @param node MDX JSX 노드
 * @param transformRecursively 내부 JSX 컴포넌트를 재귀적으로 변환하는 함수
 * @returns 변환된 마크다운 노드
 */
export function handleSwaggerDescriptionComponent(
  node: MdxJsxFlowElement | MdxJsxTextElement,
  transformRecursively: (ast: Node) => {
    ast: Node;
    unhandledTags: Set<string>;
  },
): { ast: Root; unhandledTags: Set<string> } {
  return unwrapJsxNode(node, transformRecursively);
}

/**
 * SwaggerResponse 컴포넌트 처리
 * @param node MDX JSX 노드
 * @param props 컴포넌트 속성
 * @param transformRecursively 내부 JSX 컴포넌트를 재귀적으로 변환하는 함수
 * @returns 변환된 마크다운 노드
 */
export function handleSwaggerResponseComponent(
  node: MdxJsxFlowElement | MdxJsxTextElement,
  transformRecursively: (ast: Node) => {
    ast: Node;
    unhandledTags: Set<string>;
  },
): { ast: Root; unhandledTags: Set<string> } {
  const props = extractMdxJsxAttributes(node);
  const description =
    typeof props.description === "string"
      ? props.description
      : JSON.stringify(props.description);

  // 헤더 노드 생성
  const headerNode = {
    type: "paragraph",
    children: [
      {
        type: "strong",
        children: [{ type: "text", value: props.status }],
      },
      {
        type: "text",
        value: ` - ${description}`,
      },
    ],
  };

  const results = node.children.map(transformRecursively);
  const newChildren = results.map((result) => result.ast);
  const unhandledTags = results.reduce(
    (acc, result) => acc.union(result.unhandledTags),
    new Set<string>(),
  );

  // 최종 노드 구성
  return {
    ast: {
      type: "root",
      children: [headerNode, ...newChildren],
    } as Root,
    unhandledTags,
  };
}
