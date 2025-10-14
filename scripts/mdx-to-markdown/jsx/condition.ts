import type { Paragraph, Root } from "mdast";
import type { MdxJsxFlowElement, MdxJsxTextElement } from "mdast-util-mdx";
import type { Node } from "unist";

import { extractMdxJsxAttributes } from "./common.ts";

/**
 * Condition 컴포넌트 처리
 * 특정 조건을 HTML 주석으로 변환하는 컴포넌트
 *
 * 다양한 조건 속성 지원:
 * - if: 조건부 표시 (예: <Condition if="browser">)
 * - when: 시간 기반 조건 (예: <Condition when="future">)
 * - language: 언어 기반 조건 (예: <Condition language="js">)
 * - 기타 모든 속성도 자동 처리
 *
 * 예) <Condition if="browser"> ... </Condition> ->
 * <!-- CONDITIONAL CONTENT if browser START -->
 * ...
 * <!-- CONDITIONAL CONTENT if browser END -->
 */
export function handleConditionComponent(
  node: MdxJsxFlowElement | MdxJsxTextElement,
  transformRecursively: (ast: Node) => {
    ast: Node;
    unhandledTags: Set<string>;
  },
): { ast: Node; unhandledTags: Set<string> } {
  // 속성과 값을 찾아서 주석 텍스트 생성 (빈 값이 아닌 모든 속성 처리)
  const props = extractMdxJsxAttributes(node);
  const conditionEntries = Object.entries(props).filter(
    ([, value]) => value !== undefined && value !== "",
  );

  const results = node.children.map(transformRecursively);
  const newChildren = results.map((result) => result.ast);
  const unhandledTags = results.reduce(
    (acc, result) => acc.union(result.unhandledTags),
    new Set<string>(),
  );

  // 조건이 없는 경우 기본 처리
  if (conditionEntries.length === 0) {
    return {
      ast: {
        type: "root",
        children: newChildren,
      } as Root,
      unhandledTags,
    };
  } else {
    // 첫 번째 유효한 조건 사용 (여러 조건이 있는 경우)
    const firstEntry = conditionEntries[0];

    let conditionText = "";
    if (firstEntry !== undefined) {
      const [attrName, attrValue] = firstEntry;
      conditionText = ` ${attrName}=${String(attrValue)}`;
    }

    // 주석 스타일 박스를 사용하여 조건부 콘텐츠 표시
    const resultNode = {
      type: "root",
      children: [
        {
          type: "paragraph",
          children: [
            {
              type: "html",
              value: `<!-- CONDITIONAL CONTENT${conditionText} START -->`,
            },
          ],
        } as Paragraph,
        // 내부 컴포넌트들
        ...newChildren,
        {
          type: "paragraph",
          children: [
            {
              type: "html",
              value: `<!-- CONDITIONAL CONTENT${conditionText} END -->`,
            },
          ],
        } as Paragraph,
      ],
    } as Root;

    return {
      ast: resultNode,
      unhandledTags,
    };
  }
}
