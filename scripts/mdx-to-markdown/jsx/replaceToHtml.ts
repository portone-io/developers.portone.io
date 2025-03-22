import type { Html, Root } from "mdast";
import type { MdxJsxFlowElement, MdxJsxTextElement } from "mdast-util-mdx";
import { extractMdxJsxAttributes } from "scripts/mdx-to-markdown/jsx/common";
import type { Node } from "unist";

/**
 * JSX 엘리먼트를 HTML 노드로 변환하는 함수
 *
 * @param node 변환할 MDX JSX 노드
 * @param transformRecursively 자식 노드들을 재귀적으로 변환하는 함수
 * @returns HTML 노드
 */
export function replaceToHtml(
  node: MdxJsxFlowElement | MdxJsxTextElement,
  transformRecursively: (innerAst: Node) => {
    ast: Node;
    unhandledTags: Set<string>;
  },
): { ast: Node; unhandledTags: Set<string> } {
  // 속성 추출
  const attrs = extractMdxJsxAttributes(node);
  const attrsString = Object.entries(attrs)
    .map(([key, value]) => {
      if (value === true) {
        return key;
      }
      return `${key}="${String(value).replace(/"/g, "&quot;")}"`;
    })
    .join(" ");

  // 속성이 있는 경우 공백 추가
  const attrsPart = attrsString ? ` ${attrsString}` : "";

  // 자식 노드가 있는지 확인
  const hasChildren = node.children && node.children.length > 0;

  // 자식 노드가 없는 경우 self-closing 태그 반환
  if (!hasChildren) {
    return {
      ast: {
        type: "html",
        value: `<${node.name ?? "unknown"}${attrsPart} />`,
      } satisfies Html as Html,
      unhandledTags: new Set<string>(),
    };
  }

  // 자식 노드 재귀적으로 변환
  const results = node.children.map(transformRecursively);
  const newChildren = results.map((r) => r.ast);
  const unhandledTags = results.reduce(
    (acc, r) => acc.union(r.unhandledTags),
    new Set<string>(),
  );

  // 열고 닫는 태그와 그 사이에 자식 노드 배치
  return {
    ast: {
      type: "root",
      children: [
        {
          type: "html",
          value: `<${node.name}${attrsPart}>`,
        },
        ...newChildren,
        {
          type: "html",
          value: `</${node.name}>`,
        },
      ],
    } as Root,
    unhandledTags,
  };
}
