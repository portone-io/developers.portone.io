import type { MdxJsxFlowElement, MdxJsxTextElement } from "mdast-util-mdx";
import type { Node } from "unist";

/**
 * VersionGate 컴포넌트 처리
 * V1/V2 토글 상태에 따라 다른 컨텐츠를 표시하기 위한 컴포넌트
 *
 * 주의: VersionGate 내부의 ContentRef와 같은 JSX 컴포넌트들이 제대로 처리되도록 해야 함
 * 이 함수는 내부에서 transformJsxComponentsFn을 직접 호출하여 내부 컴포넌트들을 처리함
 */
export function handleVersionGateComponent(
  node: MdxJsxFlowElement | MdxJsxTextElement,
  props: Record<string, unknown>,
  transformJsxComponentsFn: (ast: Node) => void,
) {
  // 버전 정보 추출 (v 또는 version 속성 사용)
  const version = typeof props.v === "string" ? props.v : "";

  // 버전 정보가 없는 경우 기본 처리
  if (!version) {
    const resultNode = {
      type: "root",
      children: node.children || [],
    };

    // 내부 컴포넌트들을 재귀적으로 처리
    transformJsxComponentsFn(resultNode);

    return resultNode;
  }

  // 주석 스타일 박스를 사용하여 버전 특화 콘텐츠 표시
  const resultNode = {
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
      // 내부 컴포넌트들은 아래에서 재귀적으로 처리됨
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

  // 내부 컴포넌트들을 재귀적으로 처리
  transformJsxComponentsFn(resultNode);

  return resultNode;
}
