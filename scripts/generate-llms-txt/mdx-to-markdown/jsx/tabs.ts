import type { MdxJsxFlowElement, MdxJsxTextElement } from "mdast-util-mdx";
import { visit } from "unist-util-visit";

import { extractMdxJsxAttributes } from "./common";

/**
 * Tabs 컴포넌트 처리
 */
export function handleTabsComponent(
  node: MdxJsxFlowElement | MdxJsxTextElement,
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

  const tabContents: any[] = [];

  // 각 탭 처리
  visit(
    node,
    { type: "mdxJsxFlowElement", name: "Tabs.Tab" },
    (tabNode: any) => {
      // 탭 속성 추출
      const tabProps = extractMdxJsxAttributes(tabNode);

      const title = tabProps.title || "탭";

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

      // 탭 콘텐츠에 자식 노드들 추가
      tabContents.push(tabContentStartDiv);
      tabContents.push(...(tabNode.children || []));
      tabContents.push(tabContentEndDiv);
    },
  );

  // 모든 요소를 순서대로 배치
  return {
    type: "root",
    children: [tabsStartDiv, ...tabContents, tabsEndDiv],
  };
}
