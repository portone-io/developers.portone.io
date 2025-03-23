import type { MdxJsxFlowElement, MdxJsxTextElement } from "mdast-util-mdx";

import type { MdxParseResult } from "../mdx-parser";
import type { Import } from "./imports";

/**
 * Validates an imported MDX component and returns the corresponding MDX parse result if valid
 * @param node JSX component node
 * @param parentFilePath Filepath of the parent MDX file
 * @param importedElements List of all imported elements
 * @param parseResultMap Map of all MDX parse results by slug
 * @returns The MDX parse result if successful, undefined otherwise
 */
export function validateImportedMdx(
  node: MdxJsxFlowElement | MdxJsxTextElement,
  parentFilePath: string,
  importedElements: Import[],
  parseResultMap: Record<string, MdxParseResult>,
): MdxParseResult | undefined {
  const componentName = node.name;
  if (!componentName) {
    return undefined;
  }

  // Find the corresponding import element
  const importElement = importedElements.find(
    (item) => item.name === componentName,
  );

  if (!importElement) {
    return undefined;
  }

  // Extract the import path and determine if it's an MDX file
  const importPath = importElement.from;
  const isMdxComponent = importPath.endsWith(".mdx");

  if (!isMdxComponent) {
    return undefined;
  }

  const parentSlug = parentFilePath
    .replace(/\/[^/]+\.mdx$/, "")
    .replace(/^src\/routes\/\(root\)\//, "");

  // Extract slug from the import path by removing any leading path prefixes and extension
  const subSlug = importPath
    .replace(/^\.\//, `${parentSlug}/`)
    .replace(/^~\//, "")
    .replace(/^[./]+/, "") // Remove any leading ./ ../ ~/ or combinations
    .replace(/\.mdx$/, ""); // Remove .mdx extension

  // Find the MDX parse result for this slug
  const mdxResult = Object.values(parseResultMap).find((result) =>
    result.slug.includes(subSlug),
  );

  if (!mdxResult) {
    // If MDX file not found in parseResultMap, throw an error
    throw new Error(`MDX sub-slug ${subSlug} not found in parseResultMap`);
  }

  return mdxResult;
}
