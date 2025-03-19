import type { Link } from "mdast";
import type { Node } from "unist";
import { visit } from "unist-util-visit";
import { describe, expect, it, vi } from "vitest";

// Import the function to test and the MdxParseResult type
import { transformAstForMarkdown } from "./index";
import type { MdxParseResult } from "./mdx-parser";

// Mock the necessary dependencies
vi.mock("./jsx", () => ({
  transformJsxComponents: vi.fn(),
}));

// Helper function to create a simple AST with a link
function createAstWithLink(url: string, text: string = "link text"): any {
  return {
    type: "root",
    children: [
      {
        type: "paragraph",
        children: [
          {
            type: "link",
            url,
            children: [
              {
                type: "text",
                value: text,
              },
            ],
          },
        ],
      },
    ],
  };
}

// Helper function to extract links from an AST
function extractLinks(ast: Node): Link[] {
  const links: Link[] = [];
  visit(ast, "link", (node) => {
    links.push(node as Link);
  });
  return links;
}

describe("transformLinks", () => {
  // Mock the parseResultMap with complete MdxParseResult objects
  const mockParseResultMap: Record<string, MdxParseResult> = {
    "test-slug": {
      ast: createAstWithLink("/opi/ko/readme"),
      frontmatter: {},
      content: "",
      filePath: "/path/to/test-file.mdx",
      slug: "test-slug",
      imports: [],
    },
  };

  it("should transform internal links to website URLs when useMarkdownLinks is false", () => {
    // Arrange
    const slug = "test-slug";
    const useMarkdownLinks = false;

    // Act
    const transformedAst = transformAstForMarkdown(
      slug,
      mockParseResultMap,
      useMarkdownLinks,
    );
    const links = extractLinks(transformedAst);

    // Assert
    expect(links.length).toBe(1);
    expect(links[0]?.url).toBe("https://developers.portone.io/opi/ko/readme");
  });

  it("should transform internal links to markdown file paths when useMarkdownLinks is true", () => {
    // Arrange
    const slug = "test-slug";
    const useMarkdownLinks = true;

    // Act
    const transformedAst = transformAstForMarkdown(
      slug,
      mockParseResultMap,
      useMarkdownLinks,
    );
    const links = extractLinks(transformedAst);

    // Assert
    expect(links.length).toBe(1);
    expect(links[0]?.url).toBe(
      "https://developers.portone.io/opi/ko/readme.md",
    );
  });

  it("should not transform external links", () => {
    // Arrange
    const externalUrl = "https://example.com/some-page";
    const mockParseResultMapWithExternalLink: Record<string, MdxParseResult> = {
      "test-slug": {
        ast: createAstWithLink(externalUrl),
        frontmatter: {},
        content: "",
        filePath: "/path/to/test-file.mdx",
        slug: "test-slug",
        imports: [],
      },
    };
    const slug = "test-slug";

    // Act
    const transformedAst = transformAstForMarkdown(
      slug,
      mockParseResultMapWithExternalLink,
      true,
    );
    const links = extractLinks(transformedAst);

    // Assert
    expect(links.length).toBe(1);
    expect(links[0]?.url).toBe(externalUrl);
  });

  it("should handle multiple links in the same document", () => {
    // Arrange
    const complexAst: any = {
      type: "root",
      children: [
        {
          type: "paragraph",
          children: [
            {
              type: "link",
              url: "/opi/ko/readme",
              children: [{ type: "text", value: "internal link" }],
            },
            { type: "text", value: " and " },
            {
              type: "link",
              url: "https://example.com",
              children: [{ type: "text", value: "external link" }],
            },
          ],
        },
      ],
    };

    const mockComplexParseResultMap: Record<string, MdxParseResult> = {
      "test-slug": {
        ast: complexAst,
        frontmatter: {},
        content: "",
        filePath: "/path/to/test-file.mdx",
        slug: "test-slug",
        imports: [],
      },
    };

    const slug = "test-slug";
    const useMarkdownLinks = true;

    // Act
    const transformedAst = transformAstForMarkdown(
      slug,
      mockComplexParseResultMap,
      useMarkdownLinks,
    );
    const links = extractLinks(transformedAst);

    // Assert
    expect(links.length).toBe(2);
    expect(links[0]?.url).toBe(
      "https://developers.portone.io/opi/ko/readme.md",
    );
    expect(links[1]?.url).toBe("https://example.com");
  });

  it("should handle links with query parameters and hash fragments", () => {
    // Arrange
    const complexUrl = "/opi/ko/readme?param=value#section";
    const mockParseResultMapWithComplexUrl: Record<string, MdxParseResult> = {
      "test-slug": {
        ast: createAstWithLink(complexUrl),
        frontmatter: {},
        content: "",
        filePath: "/path/to/test-file.mdx",
        slug: "test-slug",
        imports: [],
      },
    };
    const slug = "test-slug";
    const useMarkdownLinks = true;

    // Act
    const transformedAst = transformAstForMarkdown(
      slug,
      mockParseResultMapWithComplexUrl,
      useMarkdownLinks,
    );
    const links = extractLinks(transformedAst);

    // Assert
    expect(links.length).toBe(1);
    expect(links[0]?.url).toBe(
      "https://developers.portone.io/opi/ko/readme.md?param=value#section",
    );
  });
});
