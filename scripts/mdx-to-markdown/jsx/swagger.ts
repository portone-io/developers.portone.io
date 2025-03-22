import type { MdxJsxFlowElement, MdxJsxTextElement } from "mdast-util-mdx";
import type { Node } from "unist";

/**
 * Swagger 컴포넌트 처리
 * @param node MDX JSX 노드
 * @param props 컴포넌트 속성
 * @param transformJsxComponentsFn 내부 JSX 컴포넌트를 재귀적으로 변환하는 함수
 * @returns 변환된 마크다운 노드
 */
export function handleSwaggerComponent(
  node: MdxJsxFlowElement | MdxJsxTextElement,
  props: Record<string, unknown>,
  transformJsxComponentsFn: (ast: Node) => void,
) {
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
  const childrenContent = {
    type: "root",
    children: node.children || [],
  };
  transformJsxComponentsFn(childrenContent);

  // 자식 노드들을 포함한 컨테이너 생성
  return {
    type: "root",
    children: [
      headerNode,
      ...(summaryNode ? [summaryNode] : []),
      ...childrenContent.children,
    ],
  };
}

/**
 * SwaggerDescription 컴포넌트 처리
 * @param node MDX JSX 노드
 * @param _props 컴포넌트 속성
 * @param transformJsxComponentsFn 내부 JSX 컴포넌트를 재귀적으로 변환하는 함수
 * @returns 변환된 마크다운 노드
 */
export function handleSwaggerDescriptionComponent(
  node: MdxJsxFlowElement | MdxJsxTextElement,
  _props: Record<string, unknown>,
  transformJsxComponentsFn: (ast: Node) => void,
) {
  // 자식 노드들을 재귀적으로 처리
  const childrenContent = {
    type: "root",
    children: node.children || [],
  };
  transformJsxComponentsFn(childrenContent);

  // 자식 노드들을 포함한 컨테이너 생성
  return {
    type: "root",
    children: childrenContent.children,
  };
}

/**
 * SwaggerResponse 컴포넌트 처리
 * @param node MDX JSX 노드
 * @param props 컴포넌트 속성
 * @param transformJsxComponentsFn 내부 JSX 컴포넌트를 재귀적으로 변환하는 함수
 * @returns 변환된 마크다운 노드
 */
export function handleSwaggerResponseComponent(
  node: MdxJsxFlowElement | MdxJsxTextElement,
  props: Record<string, unknown>,
  transformJsxComponentsFn: (ast: Node) => void,
) {
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

  // 자식 노드들을 재귀적으로 처리
  const childrenContent = {
    type: "root",
    children: node.children || [],
  };
  transformJsxComponentsFn(childrenContent);

  // 최종 노드 구성
  return {
    type: "root",
    children: [headerNode, ...childrenContent.children],
  };
}
