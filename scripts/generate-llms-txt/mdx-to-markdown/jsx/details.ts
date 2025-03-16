import type { MdxJsxFlowElement, MdxJsxTextElement } from "mdast-util-mdx";
import type { Node } from "unist";

/**
 * Details 컴포넌트를 HTML details 태그로 변환하는 함수
 * @param node Details 컴포넌트 노드
 * @param transformJsxComponentsFn 내부 JSX 컴포넌트를 재귀적으로 변환하는 함수
 * @returns 변환된 노드
 */
export function handleDetailsComponent(
  node: MdxJsxFlowElement | MdxJsxTextElement,
  transformJsxComponentsFn: (ast: Node) => void,
) {
  const resultNodes: any[] = [];

  // summary 시작 태그
  resultNodes.push({
    type: "html",
    value: "<details>",
  });

  if (node.children && node.children.length > 0) {
    const detailsContent = {
      type: "root",
      children: node.children,
    };
    transformJsxComponentsFn(detailsContent);
    resultNodes.push(...detailsContent.children);
  } else {
    // 기본 Summary 텍스트
    resultNodes.push({
      type: "text",
      value: "상세 정보",
    });
  }

  // summary 종료 태그
  resultNodes.push({
    type: "html",
    value: "</details>",
  });

  return {
    type: "root",
    children: resultNodes,
  };
}

/**
 * Details.Summary 컴포넌트를 처리하는 함수
 * @param node Summary 컴포넌트 노드
 * @param transformJsxComponentsFn 내부 JSX 컴포넌트를 재귀적으로 변환하는 함수
 * @returns 변환된 노드
 */
export function handleDetailsSummaryComponent(
  node: MdxJsxFlowElement | MdxJsxTextElement,
  transformJsxComponentsFn: (ast: Node) => void,
) {
  const resultNodes: any[] = [];

  // summary 시작 태그
  resultNodes.push({
    type: "html",
    value: "<summary>",
  });

  // Summary 내용 추가 (AST 구조 유지)
  if (node.children && node.children.length > 0) {
    // Summary 노드를 재귀적으로 처리
    const summaryContent = {
      type: "root",
      children: node.children,
    };
    transformJsxComponentsFn(summaryContent);
    resultNodes.push(...summaryContent.children);
  } else {
    // 기본 Summary 텍스트
    resultNodes.push({
      type: "text",
      value: "상세 정보",
    });
  }

  // summary 종료 태그
  resultNodes.push({
    type: "html",
    value: "</summary>",
  });

  return {
    type: "root",
    children: resultNodes,
  };
}

/**
 * Details.Content 컴포넌트를 처리하는 함수
 * @param node Content 컴포넌트 노드
 * @param transformJsxComponentsFn 내부 JSX 컴포넌트를 재귀적으로 변환하는 함수
 * @returns 변환된 노드
 */
export function handleDetailsContentComponent(
  node: MdxJsxFlowElement | MdxJsxTextElement,
  transformJsxComponentsFn: (ast: Node) => void,
) {
  // Content 내용이 없으면 빈 노드 반환
  if (!node.children || node.children.length === 0) {
    return {
      type: "root",
      children: [],
    };
  }

  // Content 노드를 재귀적으로 처리
  const contentNodeContent = {
    type: "root",
    children: node.children,
  };
  transformJsxComponentsFn(contentNodeContent);

  return contentNodeContent;
}
