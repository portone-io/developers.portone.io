/**
 * Hint 컴포넌트 처리
 */
export function handleHintComponent(
  node: any,
  props: Record<string, any>,
): any {
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

  // 원래 자식 노드들
  const children = node.children || [];

  // 시작 태그, 원래 자식 노드들, 종료 태그를 포함하는 배열 생성
  const newChildren = [hintStartDiv, ...children, hintEndDiv];

  // 루트 노드 반환
  return {
    type: "root",
    children: newChildren,
  };
}
