import type { MdxJsxFlowElement, MdxJsxTextElement } from "mdast-util-mdx";
/**
 * MDX JSX 속성을 추출하는 함수
 * @param node MDX JSX 노드
 * @returns 추출된 속성 객체
 */
export function extractMdxJsxAttributes(
  node: MdxJsxFlowElement | MdxJsxTextElement,
): Record<string, any> {
  const props: Record<string, any> = {};
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
