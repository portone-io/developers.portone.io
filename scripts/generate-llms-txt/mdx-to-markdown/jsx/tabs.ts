import type { MdxJsxFlowElement, MdxJsxTextElement } from "mdast-util-mdx";
import type { Node } from "unist";

/**
 * Tabs 컴포넌트 처리
 * @param node Tabs 컴포넌트 노드
 * @param transformJsxComponentsFn 내부 JSX 컴포넌트를 재귀적으로 변환하는 함수
 * @returns 변환된 노드
 */
export function handleTabsComponent(
  node: MdxJsxFlowElement | MdxJsxTextElement,
  transformJsxComponentsFn: (ast: Node) => void,
) {
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

  const resultNodes: any[] = [];

  resultNodes.push(tabsStartDiv);

  // 탭 내부 자식 노드들을 재귀적으로 처리
  if (node.children && node.children.length > 0) {
    const tabsChildrenContent = {
      type: "root",
      children: node.children,
    };
    transformJsxComponentsFn(tabsChildrenContent);
    resultNodes.push(...tabsChildrenContent.children);
  }

  resultNodes.push(tabsEndDiv);

  return {
    type: "root",
    children: resultNodes,
  };
}

/**
 * 개별 Tab 컴포넌트 처리
 * @param node Tab 컴포넌트 노드
 * @param transformJsxComponentsFn 내부 JSX 컴포넌트를 재귀적으로 변환하는 함수
 * @returns 변환된 노드
 */
export function handleTabComponent(
  node: MdxJsxFlowElement | MdxJsxTextElement,
  props: Record<string, any>,
  transformJsxComponentsFn: (ast: Node) => void,
) {
  // 탭 속성 추출
  const title = props.title || "탭";

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

  const resultNodes: any[] = [];

  // 탭 콘텐츠 시작 태그 추가
  resultNodes.push(tabContentStartDiv);

  // 탭 내부 자식 노드들을 재귀적으로 처리
  if (node.children && node.children.length > 0) {
    const tabChildrenContent = {
      type: "root",
      children: node.children,
    };
    transformJsxComponentsFn(tabChildrenContent);
    resultNodes.push(...tabChildrenContent.children);
  }

  // 탭 콘텐츠 종료 태그 추가
  resultNodes.push(tabContentEndDiv);

  return {
    type: "root",
    children: resultNodes,
  };
}
