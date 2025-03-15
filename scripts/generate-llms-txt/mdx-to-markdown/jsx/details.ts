import type { MdxJsxFlowElement, MdxJsxTextElement } from "mdast-util-mdx";

/**
 * Details 컴포넌트 처리
 */
export function handleDetailsComponent(
  node: MdxJsxFlowElement | MdxJsxTextElement,
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
    resultNodes.push(...summaryNode.children);
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

  // Content 내용 추가
  if (contentNode && contentNode.children) {
    resultNodes.push(...contentNode.children);
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
