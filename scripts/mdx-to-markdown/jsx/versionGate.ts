import type { Root } from "mdast";
import type { MdxJsxFlowElement, MdxJsxTextElement } from "mdast-util-mdx";
import type { Node } from "unist";

import { extractMdxJsxAttributes } from "./common";

/**
 * VersionGate 컴포넌트 처리
 * V1/V2 토글 상태에 따라 다른 컨텐츠를 표시하기 위한 컴포넌트
 *
 * 주의: VersionGate 내부의 ContentRef와 같은 JSX 컴포넌트들이 제대로 처리되도록 해야 함
 * 이 함수는 내부에서 transformJsxComponentsFn을 직접 호출하여 내부 컴포넌트들을 처리함
 */
export function handleVersionGateComponent(
  node: MdxJsxFlowElement | MdxJsxTextElement,
  transformRecursively: (ast: Node) => {
    ast: Node;
    unhandledTags: Set<string>;
  },
): { ast: Node; unhandledTags: Set<string> } {
  // 버전 정보 추출 (v 또는 version 속성 사용)
  const props = extractMdxJsxAttributes(node);
  const version = typeof props.v === "string" ? props.v : "";

  const results = node.children.map(transformRecursively);
  const newChildren = results.map((r) => r.ast);
  const unhandledTags = results.reduce(
    (acc, r) => acc.union(r.unhandledTags),
    new Set<string>(),
  );

  // 버전 정보가 없는 경우 기본 처리
  if (!version) {
    return {
      ast: {
        type: "root",
        children: newChildren,
      } as Root,
      unhandledTags,
    };
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
      ...newChildren,
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

  return {
    ast: resultNode,
    unhandledTags,
  };
}
