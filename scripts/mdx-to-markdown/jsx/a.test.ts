import { strict as assert } from "assert";
import type { Root } from "mdast";
import type { MdxJsxFlowElement } from "mdast-util-mdx";
import { describe, it } from "vitest";

import { handleAComponent } from "./a";

describe("handleAComponent", () => {
  // Helper function to create a node AST with children for testing
  function createNodeWithChildren(
    href: string,
    className?: string,
  ): MdxJsxFlowElement {
    const attributes = [
      {
        type: "mdxJsxAttribute" as const,
        name: "href",
        value: href,
      },
    ];

    if (className) {
      attributes.push({
        type: "mdxJsxAttribute" as const,
        name: "class",
        value: className,
      });
    }

    return {
      type: "mdxJsxFlowElement",
      name: "A",
      attributes,
      children: [
        {
          type: "paragraph",
          children: [
            {
              type: "text",
              value: "Link Text",
            },
          ],
        },
      ],
    };
  }

  // Mock transform function that returns the node unchanged
  const mockTransform = (node: any) => ({
    ast: node,
    unhandledTags: new Set<string>(),
  });

  it("should handle relative href without leading slash", () => {
    const node = createNodeWithChildren("api/rest-v1");
    const result = handleAComponent(node, mockTransform);
    const htmlOpening = (result.ast as Root).children[0] as any;

    assert.equal(htmlOpening.type, "html");
    assert.ok(
      htmlOpening.value.includes('href="/api/rest-v1"'),
      `Expected href to be prefixed with /, but got: ${htmlOpening.value}`,
    );
  });

  it("should add domain to absolute href", () => {
    const node = createNodeWithChildren("/api/rest-v2");
    const result = handleAComponent(node, mockTransform);
    const htmlOpening = (result.ast as Root).children[0] as any;

    assert.equal(htmlOpening.type, "html");
    assert.ok(
      htmlOpening.value.includes(
        'href="https://developers.portone.io/api/rest-v2"',
      ),
      `Expected href to include domain, but got: ${htmlOpening.value}`,
    );
  });

  it("should not add domain if it's already included", () => {
    const alreadyCompleteUrl = "/developers.portone.io/api/rest-v1";
    const node = createNodeWithChildren(alreadyCompleteUrl);
    const result = handleAComponent(node, mockTransform);
    const htmlOpening = (result.ast as Root).children[0] as any;

    assert.equal(htmlOpening.type, "html");
    assert.ok(
      htmlOpening.value.includes(`href="${alreadyCompleteUrl}"`),
      `Expected href to remain unchanged, but got: ${htmlOpening.value}`,
    );
  });

  it("should preserve external URLs", () => {
    const externalUrl = "https://example.com/path";
    const node = createNodeWithChildren(externalUrl);
    const result = handleAComponent(node, mockTransform);
    const htmlOpening = (result.ast as Root).children[0] as any;

    assert.equal(htmlOpening.type, "html");
    assert.ok(
      htmlOpening.value.includes(`href="${externalUrl}"`),
      `Expected href to remain unchanged, but got: ${htmlOpening.value}`,
    );
  });

  it("should preserve mailto: URLs", () => {
    const mailtoUrl = "mailto:test@example.com";
    const node = createNodeWithChildren(mailtoUrl);
    const result = handleAComponent(node, mockTransform);
    const htmlOpening = (result.ast as Root).children[0] as any;

    assert.equal(htmlOpening.type, "html");
    assert.ok(
      htmlOpening.value.includes(`href="${mailtoUrl}"`),
      `Expected href to remain unchanged, but got: ${htmlOpening.value}`,
    );
  });

  it("should preserve additional attributes", () => {
    const node = createNodeWithChildren("/path", "custom-class");
    const result = handleAComponent(node, mockTransform);
    const htmlOpening = (result.ast as Root).children[0] as any;

    assert.equal(htmlOpening.type, "html");
    assert.ok(
      htmlOpening.value.includes('class="custom-class"'),
      `Expected class attribute to be preserved, but got: ${htmlOpening.value}`,
    );
    assert.ok(
      htmlOpening.value.includes('href="https://developers.portone.io/path"'),
      `Expected href to include domain, but got: ${htmlOpening.value}`,
    );
  });
});
