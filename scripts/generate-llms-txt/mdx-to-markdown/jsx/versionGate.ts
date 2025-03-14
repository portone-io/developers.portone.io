/**
 * VersionGate 컴포넌트 처리
 * V1/V2 토글 상태에 따라 다른 컨텐츠를 표시하기 위한 컴포넌트
 */
export function handleVersionGateComponent(
  node: any,
  props: Record<string, any>,
): any {
  // 버전 정보 추출 (v 또는 version 속성 사용)
  const version = props.v || "";

  // 버전 정보가 없는 경우 기본 처리
  if (!version) {
    return {
      type: "root",
      children: node.children || [],
    };
  }

  // 주석 스타일 박스를 사용하여 버전 특화 콘텐츠 표시
  return {
    type: "root",
    children: [
      {
        type: "paragraph",
        children: [
          {
            type: "html",
            value: `<!-- VERSION-SPECIFIC: ${version.toUpperCase()} ONLY CONTENT START -->`,
          },
        ],
      },
      ...(node.children || []),
      {
        type: "paragraph",
        children: [
          {
            type: "html",
            value: `<!-- VERSION-SPECIFIC: ${version.toUpperCase()} ONLY CONTENT END -->`,
          },
        ],
      },
    ],
  };
}
