import type { MdxJsxFlowElement, MdxJsxTextElement } from "mdast-util-mdx";
import type { Node } from "unist";

/**
 * Hint 컴포넌트를 HTML div로 변환하는 함수
 * @param node Hint 컴포넌트 노드
 * @param props 컴포넌트 속성
 * @param transformJsxComponentsFn 내부 JSX 컴포넌트를 재귀적으로 변환하는 함수
 * @returns 변환된 노드
 */
export function handleHintComponent(
  node: MdxJsxFlowElement | MdxJsxTextElement,
  props: Record<string, any>,
  transformJsxComponentsFn: (ast: Node) => void,
) {
  // 속성 문자열 생성
  let classNames = "hint";
  let attributesStr = "";

  // 모든 속성 처리
  Object.entries(props).forEach(([key, value]) => {
    if (value !== undefined) {
      // type 속성은 클래스로 추가
      if (key === "type") {
        classNames += ` hint-${value}`;
      } else {
        // 나머지 속성은 data-* 속성으로 추가
        const valueStr =
          typeof value === "string" ? value : JSON.stringify(value);
        attributesStr += `data-${key}="${valueStr}" `;
      }
    }
  });

  attributesStr = attributesStr.trim();

  // HTML div 시작 태그
  const hintStartDiv = {
    type: "html",
    value: `<div class="${classNames}"${attributesStr ? ` ${attributesStr}` : ""}>`,
  };

  // HTML div 종료 태그
  const hintEndDiv = {
    type: "html",
    value: "</div>",
  };

  // 자식 노드들을 재귀적으로 처리
  const childrenContent = {
    type: "root",
    children: node.children || [],
  };
  transformJsxComponentsFn(childrenContent);

  // 시작 태그, 처리된 자식 노드들, 종료 태그를 포함하는 배열 생성
  const newChildren = [hintStartDiv, ...childrenContent.children, hintEndDiv];

  // 루트 노드 반환
  return {
    type: "root",
    children: newChildren,
  };
}
