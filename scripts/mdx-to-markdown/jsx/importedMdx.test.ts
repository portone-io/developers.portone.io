import type { MdxJsxFlowElement } from "mdast-util-mdx";
import { describe, expect, it } from "vitest";

import type { MdxParseResult } from "../mdx-parser";
import { validateImportedMdx } from "./importedMdx";

describe("validateImportedMdx", () => {
  it("should validate and return MDX parse result for a valid imported MDX component", () => {
    // Mock JSX node for an imported MDX component
    const jsxNode = {
      type: "mdxJsxFlowElement",
      name: "ImportedComponent",
      attributes: [],
      children: [],
    } as MdxJsxFlowElement;

    // Mock imported elements
    const importedElements = [
      { name: "ImportedComponent", from: "./_components/imported.mdx" },
    ];

    // Mock MDX parse result
    const mockParseResult: MdxParseResult = {
      filePath: "src/routes/(root)/parent/_components/imported.mdx",
      slug: "parent/_components/imported",
      frontmatter: { title: "Imported Test" },
      imports: [],
      ast: {
        type: "root",
        children: [
          {
            type: "heading",
            depth: 2,
            children: [{ type: "text", value: "Imported Content Title" }],
          },
        ],
      },
      content: "---\ntitle: Imported Test\n---\n\n## Imported Content Title",
    };

    const parseResultMap: Record<string, MdxParseResult> = {
      "parent/_components/imported": mockParseResult,
    };

    // Call the function with parent slug
    const result = validateImportedMdx(
      jsxNode,
      "src/routes/(root)/parent/importer.mdx",
      importedElements,
      parseResultMap,
    );

    // Verify the result is the expected MDX parse result
    expect(result).toBe(mockParseResult);
  });

  it("should return undefined when component name is not found", () => {
    // Mock JSX node with no name
    const jsxNode = {
      type: "mdxJsxFlowElement",
      name: null, // Use null instead of undefined to match the type
      attributes: [],
      children: [],
    } as MdxJsxFlowElement;

    // Mock imported elements
    const importedElements = [
      { name: "ImportedComponent", from: "./_components/imported.mdx" },
    ];

    // Mock parse result map
    const parseResultMap: Record<string, MdxParseResult> = {};

    // Call the function with parent slug
    const result = validateImportedMdx(
      jsxNode,
      "src/routes/(root)/parent/importer.mdx",
      importedElements,
      parseResultMap,
    );

    // Verify the result is undefined
    expect(result).toBeUndefined();
  });

  it("should return undefined when component is not in imported elements", () => {
    // Mock JSX node for a component not in imported elements
    const jsxNode = {
      type: "mdxJsxFlowElement",
      name: "UnknownComponent",
      attributes: [],
      children: [],
    } as MdxJsxFlowElement;

    // Mock imported elements (doesn't include UnknownComponent)
    const importedElements = [
      { name: "KnownComponent", from: "./_components/known.mdx" },
    ];

    // Mock parse result map
    const parseResultMap: Record<string, MdxParseResult> = {};

    // Call the function with parent slug
    const result = validateImportedMdx(
      jsxNode,
      "src/routes/(root)/parent/importer.mdx",
      importedElements,
      parseResultMap,
    );

    // Verify the result is undefined
    expect(result).toBeUndefined();
  });

  it("should return undefined when import path doesn't end with .mdx", () => {
    // Mock JSX node
    const jsxNode = {
      type: "mdxJsxFlowElement",
      name: "NonMdxComponent",
      attributes: [],
      children: [],
    } as MdxJsxFlowElement;

    // Mock imported elements with non-MDX import
    const importedElements = [{ name: "NonMdxComponent", from: "react" }];

    // Mock parse result map
    const parseResultMap: Record<string, MdxParseResult> = {};

    // Call the function with parent slug
    const result = validateImportedMdx(
      jsxNode,
      "src/routes/(root)/parent/importer.mdx",
      importedElements,
      parseResultMap,
    );

    // Verify the result is undefined
    expect(result).toBeUndefined();
  });

  it("should throw an error when MDX file is not found in parse results", () => {
    // Mock JSX node
    const jsxNode = {
      type: "mdxJsxFlowElement",
      name: "MissingComponent",
      attributes: [],
      children: [],
    } as MdxJsxFlowElement;

    // Mock imported elements
    const importedElements = [
      { name: "MissingComponent", from: "./_components/missing.mdx" },
    ];

    // Empty parse result map (missing.mdx not included)
    const parseResultMap: Record<string, MdxParseResult> = {};

    // Expect the function to throw an error with updated error message
    expect(() =>
      validateImportedMdx(
        jsxNode,
        "src/routes/(root)/parent/importer.mdx",
        importedElements,
        parseResultMap,
      ),
    ).toThrow(
      "MDX sub-slug parent/_components/missing not found in parseResultMap",
    );
  });

  it("should handle paths with various prefixes", () => {
    // Create three mock JSX nodes with different import path styles
    const relativeNode = {
      type: "mdxJsxFlowElement",
      name: "RelativeComponent",
      attributes: [],
      children: [],
    } as MdxJsxFlowElement;

    const tildaNode = {
      type: "mdxJsxFlowElement",
      name: "TildaComponent",
      attributes: [],
      children: [],
    } as MdxJsxFlowElement;

    const nestedNode = {
      type: "mdxJsxFlowElement",
      name: "NestedComponent",
      attributes: [],
      children: [],
    } as MdxJsxFlowElement;

    // Mock imported elements with different path styles
    const importedElements = [
      { name: "RelativeComponent", from: "./component.mdx" },
      { name: "TildaComponent", from: "~/components/tilda.mdx" },
      { name: "NestedComponent", from: "../nested/path/component.mdx" },
    ];

    // Mock MDX parse results with slugs that match the processed paths
    const componentResult: MdxParseResult = {
      filePath: "component.mdx",
      slug: "parent/component",
      frontmatter: {},
      imports: [],
      ast: { type: "root", children: [] },
      content: "",
    };

    const tildaResult: MdxParseResult = {
      filePath: "components/tilda.mdx",
      slug: "components/tilda",
      frontmatter: {},
      imports: [],
      ast: { type: "root", children: [] },
      content: "",
    };

    const nestedResult: MdxParseResult = {
      filePath: "nested/path/component.mdx",
      slug: "nested/path/component",
      frontmatter: {},
      imports: [],
      ast: { type: "root", children: [] },
      content: "",
    };

    const parseResultMap: Record<string, MdxParseResult> = {
      "parent/component": componentResult,
      "components/tilda": tildaResult,
      "nested/path/component": nestedResult,
    };

    // Test the relative path
    expect(
      validateImportedMdx(
        relativeNode,
        "src/routes/(root)/parent/importer.mdx",
        importedElements,
        parseResultMap,
      ),
    ).toBe(componentResult);

    // Test the tilda path
    expect(
      validateImportedMdx(
        tildaNode,
        "src/routes/(root)/parent/importer.mdx",
        importedElements,
        parseResultMap,
      ),
    ).toBe(tildaResult);

    // Test the nested path
    expect(
      validateImportedMdx(
        nestedNode,
        "src/routes/(root)/parent/importer.mdx",
        importedElements,
        parseResultMap,
      ),
    ).toBe(nestedResult);
  });
});
