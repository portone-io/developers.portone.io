import type { MdxJsxFlowElement, MdxJsxTextElement } from "mdast-util-mdx";
import type { Node } from "unist";

/**
 * Details 컴포넌트를 HTML details/summary 태그로 변환하는 함수
 * @param node Details 컴포넌트 노드
 * @param transformJsxComponentsFn 내부 JSX 컴포넌트를 재귀적으로 변환하는 함수
 * @returns 변환된 노드
 */
export function handleDetailsComponent(
  node: MdxJsxFlowElement | MdxJsxTextElement,
  transformJsxComponentsFn: (ast: Node) => void,
) {
  // 결과 노드들을 저장할 배열
  const resultNodes: any[] = [];

  // Summary와 Content 노드 찾기
  let summaryNode = null;
  let contentNode = null;

  // 자식 노드들을 순회하면서 Summary와 Content 컴포넌트 찾기
  if (node.children && Array.isArray(node.children)) {
    for (const child of node.children) {
      if (child.type === "mdxJsxFlowElement") {
        if (child.name === "Details.Summary") {
          summaryNode = child;
        } else if (child.name === "Details.Content") {
          contentNode = child;
        }
      }
    }
  }

  // details 시작 태그
  resultNodes.push({
    type: "html",
    value: "<details>",
  });

  // summary 시작 태그
  resultNodes.push({
    type: "html",
    value: "<summary>",
  });

  // Summary 내용 추가 (AST 구조 유지)
  if (summaryNode && summaryNode.children && summaryNode.children.length > 0) {
    // Summary 노드를 재귀적으로 처리
    const summaryContent = {
      type: "root",
      children: summaryNode.children,
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

  // Content 내용 추가 및 재귀적 처리
  if (contentNode && contentNode.children) {
    // Content 노드를 재귀적으로 처리
    const contentNodeContent = {
      type: "root",
      children: contentNode.children,
    };
    transformJsxComponentsFn(contentNodeContent);
    resultNodes.push(...contentNodeContent.children);
  }

  // details 닫기
  resultNodes.push({
    type: "html",
    value: "</details>",
  });

  return {
    type: "root",
    children: resultNodes,
  };
}
