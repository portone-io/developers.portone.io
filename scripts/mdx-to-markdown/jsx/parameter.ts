import type { BlockContent, ListItem, Paragraph, Root, Text } from "mdast";
import type { MdxJsxFlowElement, MdxJsxTextElement } from "mdast-util-mdx";
import type { Node } from "unist";

import { extractMdxJsxAttributes, unwrapJsxNode } from "./common.ts";

/**
 * Parameter.TypeDef 컴포넌트를 마크다운으로 변환하는 함수
 * <Parameter.TypeDef ident="batch_soc_choice" type="'percard' | 'cocard'" optional>
 *   **결제창에서 주민번호/사업자 번호 고정여부 설정**
 *
 *   - S: 주민번호만 표시
 *   - C: 사업자번호만 표시
 * </Parameter.TypeDef>
 *
 * 변환 결과:
 * - batch_soc_choice?: 'percard' | 'cocard'
 *
 *    결제창에서 주민번호/사업자 번호 고정여부 설정
 *
 *    - S: 주민번호만 표시
 *    - C: 사업자번호만 표시
 *
 * @param node Parameter.TypeDef 컴포넌트 노드
 * @param transformRecursively 내부 JSX 컴포넌트를 재귀적으로 변환하는 함수
 * @returns 변환된 노드
 */
export function handleParameterTypeDefComponent(
  node: MdxJsxFlowElement | MdxJsxTextElement,
  transformRecursively: (ast: Node) => {
    ast: Node;
    unhandledTags: Set<string>;
  },
): { ast: Root; unhandledTags: Set<string> } {
  const props = extractMdxJsxAttributes(node);
  const ident = props.ident as string | undefined;
  const type = props.type as string | undefined;
  const isOptional = "optional" in props;

  // If there's no ident but there is a type, use the type as the identifier
  // If neither ident nor type is provided, just unwrap the node
  if (!ident && !type) {
    return unwrapJsxNode(node, transformRecursively);
  }

  // Process the content (description and any other nested content)
  const { ast: unwrappedContent, unhandledTags } = unwrapJsxNode(
    node,
    transformRecursively,
  );

  // Create the parameter definition text node
  const parameterDefText: Text = {
    type: "text",
    value: ident
      ? `${ident}${isOptional ? "?" : ""}: ${type || ""}`
      : `${type}${isOptional ? "?" : ""}`,
  };

  // Create the paragraph containing the parameter definition
  const parameterDefParagraph: Paragraph = {
    type: "paragraph",
    children: [parameterDefText],
  };

  // Check if there's unwrapped content to include
  if (
    unwrappedContent.type === "root" &&
    unwrappedContent.children &&
    unwrappedContent.children.length > 0
  ) {
    // Create a list item that includes both the parameter definition and its description
    // This will make the description part of the list item, properly indented
    const listItemChildren: BlockContent[] = [parameterDefParagraph];

    // Add all child content from the unwrapped content
    unwrappedContent.children.forEach((child) => {
      listItemChildren.push(child as BlockContent);
    });

    // Create the list item with the parameter definition and description
    const parameterLine: ListItem = {
      type: "listItem",
      spread: true, // Set spread to true for loose list formatting with paragraphs
      children: listItemChildren,
    };

    return {
      ast: {
        type: "root",
        children: [parameterLine],
      } as Root,
      unhandledTags,
    };
  } else {
    // If there's no content, just return a simple parameter definition
    const parameterLine: ListItem = {
      type: "listItem",
      spread: false,
      children: [parameterDefParagraph],
    };

    return {
      ast: {
        type: "root",
        children: [parameterLine],
      } as Root,
      unhandledTags,
    };
  }
}
