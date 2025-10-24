import type {
  BlockContent,
  Link,
  ListItem,
  Paragraph,
  Root,
  Text,
} from "mdast";
import type { MdxJsxFlowElement, MdxJsxTextElement } from "mdast-util-mdx";

import { extractMdxJsxAttributes } from "./common.ts";

export function sdkChangelog() {
  // markdown link to https://developers.portone.io/sdk/ko/v2-sdk/changelog
  return {
    type: "link",
    url: "https://developers.portone.io/sdk/ko/v2-sdk/changelog",
    children: [
      {
        type: "text",
        value: "SDK Changelog",
      },
    ],
  };
}

/**
 * SDKParameter 컴포넌트를 마크다운으로 변환하는 함수
 * <SDKParameter path="#/resources/request/IssueBillingKeyAndPayRequest" ident="request" optional />
 *
 * 변환 결과:
 * - request?: IssueBillingKeyAndPayRequest
 *   [definition link](https://developers.portone.io/schema/browser-sdk.yml#/resources/request/IssueBillingKeyAndPayRequest)
 *
 * @param node SDKParameter 컴포넌트 노드
 * @returns 변환된 노드
 */
export function handleSDKParameterComponent(
  node: MdxJsxFlowElement | MdxJsxTextElement,
): { ast: Root; unhandledTags: Set<string> } {
  const props = extractMdxJsxAttributes(node);
  const path = props.path as string;
  const ident = props.ident as string | undefined;
  const isOptional = "optional" in props;

  // If there's no path, throw an error.
  if (!path) {
    throw new Error("No path found in SDKParameter.");
  }

  // Extract type name from the path
  const typeName = path.split("/").pop() || "";

  // Create the parameter definition text node
  const identText = ident ? `${ident}${isOptional ? "?" : ""}: ` : "";
  const parameterDefText: Text = {
    type: "text",
    value: `${identText}${typeName}`,
  };

  // Create the paragraph containing the parameter definition
  const parameterDefParagraph: Paragraph = {
    type: "paragraph",
    children: [parameterDefText],
  };

  // Create the definition link
  const linkUrl = `https://developers.portone.io/schema/browser-sdk.yml${path}`;
  const linkText: Text = {
    type: "text",
    value: "definition link",
  };

  const definitionLink: Link = {
    type: "link",
    url: linkUrl,
    title: null,
    children: [linkText],
  };

  const linkParagraph: Paragraph = {
    type: "paragraph",
    children: [definitionLink],
  };

  // Create the list item with the parameter definition and link
  const listItemChildren: BlockContent[] = [
    parameterDefParagraph,
    linkParagraph,
  ];

  // Create the list item node
  const parameterLine: ListItem = {
    type: "listItem",
    spread: true,
    children: listItemChildren,
  };

  return {
    ast: {
      type: "root",
      children: [parameterLine],
    } as Root,
    unhandledTags: new Set<string>(),
  };
}
