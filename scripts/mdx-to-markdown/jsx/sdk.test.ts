import type { Link, ListItem, Paragraph, Text } from "mdast";
import type { MdxJsxFlowElement } from "mdast-util-mdx";
import { describe, expect, it } from "vitest";

import { handleSDKParameterComponent, sdkChangelog } from "./sdk";

describe("sdkChangelog", () => {
  it("returns a link to the SDK changelog", () => {
    const result = sdkChangelog();

    expect(result.type).toBe("link");
    expect(result.url).toBe(
      "https://developers.portone.io/sdk/ko/v2-sdk/changelog",
    );
    expect(result.children).toHaveLength(1);
    expect(result.children[0]!.type).toBe("text");
    expect((result.children[0] as Text).value).toBe("SDK Changelog");
  });
});

describe("handleSDKParameterComponent", () => {
  it("transforms SDKParameter with all attributes into markdown", () => {
    // Create test SDKParameter node
    const node = {
      type: "mdxJsxFlowElement",
      name: "SDKParameter",
      attributes: [
        {
          type: "mdxJsxAttribute",
          name: "path",
          value: "#/resources/request/IssueBillingKeyAndPayRequest",
        },
        { type: "mdxJsxAttribute", name: "ident", value: "request" },
        { type: "mdxJsxAttribute", name: "optional", value: true },
      ],
      children: [],
    } as MdxJsxFlowElement;

    // Execute handleSDKParameterComponent function
    const result = handleSDKParameterComponent(node);

    // Verify results
    expect(result.ast.type).toBe("root");
    expect(result.ast.children).toHaveLength(1);

    // First child should be a listItem containing parameter definition
    const listItem = result.ast.children[0] as ListItem;
    expect(listItem).toBeDefined();
    expect(listItem.type).toBe("listItem");
    expect(listItem.spread).toBe(true);
    expect(listItem.children).toHaveLength(2); // Parameter def paragraph + link paragraph

    // First child of list item should be the parameter definition paragraph
    const paramDefParagraph = listItem.children[0] as Paragraph;
    expect(paramDefParagraph).toBeDefined();
    expect(paramDefParagraph.type).toBe("paragraph");
    expect(paramDefParagraph.children).toHaveLength(1);

    const parameterDefText = paramDefParagraph.children[0] as Text;
    expect(parameterDefText).toBeDefined();
    expect(parameterDefText.type).toBe("text");
    expect(parameterDefText.value).toBe(
      "request?: IssueBillingKeyAndPayRequest",
    );

    // Second child should be the link paragraph
    const linkParagraph = listItem.children[1] as Paragraph;
    expect(linkParagraph).toBeDefined();
    expect(linkParagraph.type).toBe("paragraph");
    expect(linkParagraph.children).toHaveLength(1);

    const link = linkParagraph.children[0] as Link;
    expect(link).toBeDefined();
    expect(link.type).toBe("link");
    expect(link.url).toBe(
      "https://developers.portone.io/schema/browser-sdk.yml#/resources/request/IssueBillingKeyAndPayRequest",
    );
    expect(link.children).toHaveLength(1);
    expect(link.children[0]!.type).toBe("text");
    expect((link.children[0] as Text).value).toBe("definition link");

    expect(result.unhandledTags.size).toBe(0);
  });

  it("transforms SDKParameter with no ident attribute", () => {
    // Create test SDKParameter node with no ident
    const node = {
      type: "mdxJsxFlowElement",
      name: "SDKParameter",
      attributes: [
        {
          type: "mdxJsxAttribute",
          name: "path",
          value: "#/resources/request/PaymentRequest",
        },
      ],
      children: [],
    } as MdxJsxFlowElement;

    // Execute handleSDKParameterComponent function
    const result = handleSDKParameterComponent(node);

    // Verify results
    expect(result.ast.type).toBe("root");
    expect(result.ast.children).toHaveLength(1);

    const listItem = result.ast.children[0] as ListItem;
    expect(listItem.type).toBe("listItem");
    expect(listItem.children).toHaveLength(2);

    const paramDefParagraph = listItem.children[0] as Paragraph;
    const parameterDefText = paramDefParagraph.children[0] as Text;
    expect(parameterDefText.value).toBe("PaymentRequest");

    const linkParagraph = listItem.children[1] as Paragraph;
    const link = linkParagraph.children[0] as Link;
    expect(link.url).toBe(
      "https://developers.portone.io/schema/browser-sdk.yml#/resources/request/PaymentRequest",
    );

    expect(result.unhandledTags.size).toBe(0);
  });

  it("throws an error when no path is provided", () => {
    // Create test SDKParameter node with no path
    const node = {
      type: "mdxJsxFlowElement",
      name: "SDKParameter",
      attributes: [
        { type: "mdxJsxAttribute", name: "ident", value: "request" },
      ],
      children: [],
    } as MdxJsxFlowElement;

    // Expect the function to throw an error
    expect(() => handleSDKParameterComponent(node)).toThrow(
      "No path found in SDKParameter.",
    );
  });

  it("correctly creates markdown with complex path segments", () => {
    // Create test SDKParameter node with complex path
    const node = {
      type: "mdxJsxFlowElement",
      name: "SDKParameter",
      attributes: [
        {
          type: "mdxJsxAttribute",
          name: "path",
          value: "#/resources/response/ComplexResponse",
        },
        { type: "mdxJsxAttribute", name: "ident", value: "responseData" },
      ],
      children: [],
    } as MdxJsxFlowElement;

    // Execute handleSDKParameterComponent function
    const result = handleSDKParameterComponent(node);

    // Verify results
    const listItem = result.ast.children[0] as ListItem;
    const paramDefParagraph = listItem.children[0] as Paragraph;
    const parameterDefText = paramDefParagraph.children[0] as Text;
    expect(parameterDefText.value).toBe("responseData: ComplexResponse");

    const linkParagraph = listItem.children[1] as Paragraph;
    const link = linkParagraph.children[0] as Link;
    expect(link.url).toBe(
      "https://developers.portone.io/schema/browser-sdk.yml#/resources/response/ComplexResponse",
    );
  });
});
