import type { Node, Root } from "mdast";
import type { MdxJsxFlowElement, MdxJsxTextElement } from "mdast-util-mdx";
/**
 * MDX JSX 속성을 추출하는 함수
 * @param node MDX JSX 노드
 * @returns 추출된 속성 객체
 */
export function extractMdxJsxAttributes(
  node: MdxJsxFlowElement | MdxJsxTextElement,
): Record<string, unknown> {
  const props: Record<string, unknown> = {};
  if (node.attributes && Array.isArray(node.attributes)) {
    for (const attr of node.attributes) {
      if (attr.type === "mdxJsxAttribute" && attr.name) {
        if (attr.value && typeof attr.value === "string") {
          props[attr.name] = attr.value;
        } else if (
          attr.value &&
          typeof attr.value === "object" &&
          "type" in attr.value &&
          attr.value.type === "mdxJsxAttributeValueExpression"
        ) {
          props[attr.name] = attr.value.value;
        } else {
          props[attr.name] = true;
        }
      }
    }
  }
  return props;
}

export function unwrapJsxNode(
  node: MdxJsxFlowElement | MdxJsxTextElement,
  transformRecursively: (ast: Node) => {
    ast: Node;
    unhandledTags: Set<string>;
  },
): { ast: Root; unhandledTags: Set<string> } {
  if (!node.children || node.children.length === 0) {
    // Nothing to keep, remove this node from the AST
    return {
      ast: { type: "root", children: [] } as Root,
      unhandledTags: new Set(),
    };
  }

  const results = node.children.map(transformRecursively);

  // 기본적으로 자식 노드만 유지
  return {
    ast: {
      type: "root",
      children: results.map((r) => r.ast),
    } as Root,
    unhandledTags: results.reduce(
      (acc, r) => acc.union(r.unhandledTags),
      new Set<string>(),
    ),
  };
}
