import type { Html, Root } from "mdast";
import type { MdxJsxFlowElement, MdxJsxTextElement } from "mdast-util-mdx";
import type { Node } from "unist";
import { describe, expect, it, vi } from "vitest";

import { replaceToHtml } from "./replaceToHtml";

describe("replaceToHtml", () => {
  it("should convert a self-closing JSX element to HTML", () => {
    const jsxNode = {
      type: "mdxJsxTextElement",
      name: "hr",
      attributes: [],
      children: [],
    } as MdxJsxTextElement;

    const mockTransformRecursively = vi.fn((ast: Node) => ({
      ast,
      unhandledTags: new Set<string>(),
    }));

    const result = replaceToHtml(jsxNode, mockTransformRecursively);

    expect(result.ast).toEqual({
      type: "html",
      value: "<hr />",
    } as Html);
    expect(result.unhandledTags.size).toBe(0);
    expect(mockTransformRecursively).not.toHaveBeenCalled();
  });

  it("should convert a JSX element with attributes to HTML", () => {
    const jsxNode = {
      type: "mdxJsxFlowElement",
      name: "div",
      attributes: [
        {
          type: "mdxJsxAttribute",
          name: "class",
          value: "container",
        },
        {
          type: "mdxJsxAttribute",
          name: "id",
          value: "main-content",
        },
        {
          type: "mdxJsxAttribute",
          name: "disabled",
          value: null,
        },
      ],
      children: [],
    } as MdxJsxFlowElement;

    const mockTransformRecursively = vi.fn((ast: Node) => ({
      ast,
      unhandledTags: new Set<string>(),
    }));

    const result = replaceToHtml(jsxNode, mockTransformRecursively);

    expect(result.ast).toEqual({
      type: "html",
      value: '<div class="container" id="main-content" disabled />',
    } as Html);
    expect(result.unhandledTags.size).toBe(0);
    expect(mockTransformRecursively).not.toHaveBeenCalled();
  });

  it("should handle JSX element with children", () => {
    const jsxNode = {
      type: "mdxJsxFlowElement",
      name: "div",
      attributes: [
        {
          type: "mdxJsxAttribute",
          name: "class",
          value: "container",
        },
      ],
      children: [
        {
          type: "paragraph",
          children: [
            {
              type: "text",
              value: "Hello world",
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

    const result = replaceToHtml(jsxNode, mockTransformRecursively);

    expect(result.ast).toEqual({
      type: "root",
      children: [
        {
          type: "html",
          value: '<div class="container">',
        },
        {
          type: "paragraph",
          children: [
            {
              type: "text",
              value: "Hello world",
            },
          ],
        },
        {
          type: "html",
          value: "</div>",
        },
      ],
    } as Root);
    expect(result.unhandledTags.size).toBe(0);
    expect(mockTransformRecursively).toHaveBeenCalledTimes(1);
  });

  it("should handle quotes in attribute values", () => {
    const jsxNode = {
      type: "mdxJsxFlowElement",
      name: "div",
      attributes: [
        {
          type: "mdxJsxAttribute",
          name: "title",
          value: 'Example with "quotes"',
        },
      ],
      children: [],
    } as MdxJsxFlowElement;

    const mockTransformRecursively = vi.fn((ast: Node) => ({
      ast,
      unhandledTags: new Set<string>(),
    }));

    const result = replaceToHtml(jsxNode, mockTransformRecursively);

    expect(result.ast).toEqual({
      type: "html",
      value: '<div title="Example with &quot;quotes&quot;" />',
    } as Html);
    expect(result.unhandledTags.size).toBe(0);
  });

  it("should collect unhandled tags from children", () => {
    const jsxNode = {
      type: "mdxJsxFlowElement",
      name: "div",
      attributes: [],
      children: [
        { type: "text", value: "Some text" },
        {
          type: "mdxJsxFlowElement",
          name: "CustomComponent",
          attributes: [],
          children: [],
        },
      ],
    } as MdxJsxFlowElement;

    // Mock transformRecursively function that returns unhandled tags
    const mockTransformRecursively = vi
      .fn()
      .mockImplementationOnce((ast: Node) => ({
        ast,
        unhandledTags: new Set<string>(),
      }))
      .mockImplementationOnce((ast: Node) => ({
        ast,
        unhandledTags: new Set(["CustomComponent"]),
      }));

    const result = replaceToHtml(jsxNode, mockTransformRecursively);

    expect(result.unhandledTags.size).toBe(1);
    expect(result.unhandledTags.has("CustomComponent")).toBe(true);
    expect(mockTransformRecursively).toHaveBeenCalledTimes(2);
  });
});
