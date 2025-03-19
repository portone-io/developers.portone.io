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
  props: Record<string, any>,
  transformJsxComponentsFn: (ast: Node) => void,
) {
  // 헤더 생성 (메서드 + 경로)
  const headerNode = {
    type: "paragraph",
    children: [
      {
        type: "strong",
        children: [
          {
            type: "text",
            value: props.method.toUpperCase(),
          },
        ],
      },
      {
        type: "text",
        value: ` ${props.baseUrl}${props.path}`,
      },
    ],
  };

  // 요약 정보
  const summaryNode = props.summary
    ? {
        type: "paragraph",
        children: [
          {
            type: "emphasis",
            children: [{ type: "text", value: props.summary }],
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
  _props: Record<string, any>,
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
  props: Record<string, any>,
  transformJsxComponentsFn: (ast: Node) => void,
) {
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
        value: ` - ${props.description}`,
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
