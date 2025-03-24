import type { MdxJsxFlowElement } from "mdast-util-mdx";
import type { Node, Parent } from "unist";
import { describe, expect, it, vi } from "vitest";

import { handleParameterTypeDefComponent } from "./parameter";

describe("handleParameterTypeDefComponent", () => {
  it("transforms Parameter.TypeDef with all attributes into markdown", () => {
    // Create test Parameter.TypeDef node
    const node = {
      type: "mdxJsxFlowElement",
      name: "Parameter.TypeDef",
      attributes: [
        { type: "mdxJsxAttribute", name: "ident", value: "batch_soc_choice" },
        {
          type: "mdxJsxAttribute",
          name: "type",
          value: "'percard' | 'cocard'",
        },
        { type: "mdxJsxAttribute", name: "optional", value: true },
      ],
      children: [
        {
          type: "paragraph",
          children: [
            {
              type: "strong",
              children: [
                {
                  type: "text",
                  value: "결제창에서 주민번호/사업자 번호 고정여부 설정",
                },
              ],
            },
          ],
        },
        {
          type: "list",
          ordered: false,
          children: [
            {
              type: "listItem",
              children: [
                {
                  type: "paragraph",
                  children: [{ type: "text", value: "S: 주민번호만 표시" }],
                },
              ],
            },
            {
              type: "listItem",
              children: [
                {
                  type: "paragraph",
                  children: [{ type: "text", value: "C: 사업자번호만 표시" }],
                },
              ],
            },
          ],
        },
      ],
    } as MdxJsxFlowElement;

    // Mock transformRecursively function
    const mockTransformRecursively = vi.fn((ast: Node) => ({
      ast,
      unhandledTags: new Set<string>(),
    }));

    // Execute handleParameterTypeDefComponent function
    const result = handleParameterTypeDefComponent(
      node,
      mockTransformRecursively,
    );

    // Verify results
    expect(result.ast.type).toBe("root");
    expect(result.ast.children.length).toBe(1);

    // First child should be a listItem containing parameter definition
    const listItem = result.ast.children[0] as Parent;
    expect(listItem).toBeDefined();
    expect(listItem.type).toBe("listItem");
    expect((listItem as any).spread).toBe(true); // Should be spread: true for loose list items with multiple blocks
    expect(listItem.children.length).toBe(3); // paragraph with parameter + original paragraph + original list

    // First child of list item should be the parameter definition paragraph
    const paramDefParagraph = listItem.children[0] as Parent;
    expect(paramDefParagraph).toBeDefined();
    expect(paramDefParagraph.type).toBe("paragraph");
    expect(paramDefParagraph.children.length).toBe(1);

    const parameterDefText = paramDefParagraph.children[0];
    expect(parameterDefText).toBeDefined();
    expect(parameterDefText?.type).toBe("text");
    expect((parameterDefText as any).value).toBe(
      "batch_soc_choice?: 'percard' | 'cocard'",
    );

    // Check that original content is preserved
    const originalParagraph = listItem.children[1] as Parent;
    expect(originalParagraph).toBeDefined();
    expect(originalParagraph.type).toBe("paragraph");
    expect(originalParagraph.children.length).toBe(1);
    expect(originalParagraph?.children[0]?.type).toBe("strong");

    const originalList = listItem.children[2] as Parent;
    expect(originalList).toBeDefined();
    expect(originalList.type).toBe("list");
    expect(originalList.children.length).toBe(2); // Two list items from the original content

    expect(result.unhandledTags.size).toBe(0);
  });

  it("transforms Parameter.TypeDef with only ident into markdown", () => {
    // Create test Parameter.TypeDef node with only ident
    const node = {
      type: "mdxJsxFlowElement",
      name: "Parameter.TypeDef",
      attributes: [
        { type: "mdxJsxAttribute", name: "ident", value: "simple_param" },
      ],
      children: [
        {
          type: "paragraph",
          children: [{ type: "text", value: "Simple parameter description" }],
        },
      ],
    } as MdxJsxFlowElement;

    // Mock transformRecursively function
    const mockTransformRecursively = vi.fn((ast: Node) => ({
      ast,
      unhandledTags: new Set<string>(),
    }));

    // Execute handleParameterTypeDefComponent function
    const result = handleParameterTypeDefComponent(
      node,
      mockTransformRecursively,
    );

    // Verify results
    expect(result.ast.type).toBe("root");
    expect(result.ast.children.length).toBe(1);

    // First child should be a listItem containing parameter definition
    const listItem = result.ast.children[0] as Parent;
    expect(listItem).toBeDefined();
    expect(listItem.type).toBe("listItem");
    expect((listItem as any).spread).toBe(true);
    expect(listItem.children.length).toBe(2); // parameter def paragraph + original content paragraph

    // First child is parameter definition paragraph
    const paramDefParagraph = listItem.children[0] as Parent;
    expect(paramDefParagraph).toBeDefined();
    expect(paramDefParagraph.type).toBe("paragraph");
    expect(paramDefParagraph.children.length).toBe(1);

    const parameterDefText = paramDefParagraph.children[0];
    expect(parameterDefText).toBeDefined();
    expect(parameterDefText?.type).toBe("text");
    expect((parameterDefText as any).value).toBe("simple_param: ");

    // Should have the original description content as second child of list item
    const originalParagraph = listItem.children[1] as Parent;
    expect(originalParagraph).toBeDefined();
    expect(originalParagraph.type).toBe("paragraph");
    expect(originalParagraph.children.length).toBe(1);
    expect((originalParagraph.children[0] as any).value).toBe(
      "Simple parameter description",
    );

    expect(result.unhandledTags.size).toBe(0);
  });

  it("properly unwraps when no ident is provided", () => {
    // Create test Parameter.TypeDef node with no ident
    const node = {
      type: "mdxJsxFlowElement",
      name: "Parameter.TypeDef",
      attributes: [],
      children: [
        {
          type: "paragraph",
          children: [{ type: "text", value: "This should just be unwrapped" }],
        },
      ],
    } as MdxJsxFlowElement;

    // Mock transformRecursively function - simulate unwrapping behavior
    const mockTransformRecursively = vi.fn((_ast: Node) => ({
      ast: {
        type: "root",
        children: [
          {
            type: "paragraph",
            children: [
              { type: "text", value: "This should just be unwrapped" },
            ],
          },
        ],
      },
      unhandledTags: new Set<string>(),
    }));

    // Execute handleParameterTypeDefComponent function
    const result = handleParameterTypeDefComponent(
      node,
      mockTransformRecursively,
    );

    // Verify results - should just have unwrapped the content
    expect(result.ast.type).toBe("root");
    expect(result.ast.children.length).toBe(1);

    // For unwrapped content, the children from the transformRecursively result are preserved
    const unwrappedRoot = result.ast.children[0] as Parent;
    expect(unwrappedRoot).toBeDefined();
    expect(unwrappedRoot.type).toBe("root");
    expect(unwrappedRoot.children.length).toBe(1);

    const unwrappedParagraph = unwrappedRoot.children[0] as Parent;
    expect(unwrappedParagraph).toBeDefined();
    expect(unwrappedParagraph.type).toBe("paragraph");
    expect(unwrappedParagraph.children.length).toBe(1);

    const unwrappedText = unwrappedParagraph.children[0];
    expect(unwrappedText).toBeDefined();
    expect(unwrappedText?.type).toBe("text");
    expect((unwrappedText as any).value).toBe("This should just be unwrapped");

    expect(result.unhandledTags.size).toBe(0);

    // Should have called transformRecursively once
    expect(mockTransformRecursively).toHaveBeenCalledTimes(1);
  });

  it("transforms Parameter.TypeDef with type but no ident into markdown", () => {
    // Create test Parameter.TypeDef node with type but no ident
    const node = {
      type: "mdxJsxFlowElement",
      name: "Parameter.TypeDef",
      attributes: [
        { type: "mdxJsxAttribute", name: "type", value: "InicisV2BypassOnPc" },
        { type: "mdxJsxAttribute", name: "optional", value: true },
      ],
      children: [
        {
          type: "paragraph",
          children: [
            {
              type: "strong",
              children: [{ type: "text", value: "PC용 파라미터" }],
            },
          ],
        },
      ],
    } as MdxJsxFlowElement;

    // Mock transformRecursively function
    const mockTransformRecursively = vi.fn((ast: Node) => ({
      ast,
      unhandledTags: new Set<string>(),
    }));

    // Execute handleParameterTypeDefComponent function
    const result = handleParameterTypeDefComponent(
      node,
      mockTransformRecursively,
    );

    // Verify results
    expect(result.ast.type).toBe("root");
    expect(result.ast.children.length).toBe(1);

    // First child should be a listItem containing parameter definition
    const listItem = result.ast.children[0] as Parent;
    expect(listItem).toBeDefined();
    expect(listItem.type).toBe("listItem");
    expect((listItem as any).spread).toBe(true);
    expect(listItem.children.length).toBe(2); // parameter def paragraph + original content paragraph

    // First child is parameter definition paragraph
    const paramDefParagraph = listItem.children[0] as Parent;
    expect(paramDefParagraph).toBeDefined();
    expect(paramDefParagraph.type).toBe("paragraph");
    expect(paramDefParagraph.children.length).toBe(1);

    const parameterDefText = paramDefParagraph.children[0];
    expect(parameterDefText).toBeDefined();
    expect(parameterDefText?.type).toBe("text");
    expect((parameterDefText as any).value).toBe("InicisV2BypassOnPc?");

    // Should have the original description content as second child of list item
    const originalParagraph = listItem.children[1] as Parent;
    expect(originalParagraph).toBeDefined();
    expect(originalParagraph.type).toBe("paragraph");
    expect(originalParagraph.children.length).toBe(1);
    expect(originalParagraph.children[0]?.type).toBe("strong");

    expect(result.unhandledTags.size).toBe(0);
  });
});
