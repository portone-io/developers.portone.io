import type { MdxjsEsm } from "mdast-util-mdx";
import type { Node } from "unist";
import { visit } from "unist-util-visit";

export type Import = {
  name: string;
  from: string;
};

/**
 * Collects all imported elements from the MDX AST
 * @param ast MDX AST
 * @returns Array of imported elements
 */
export function collectAllImportedElements(ast: Node): Import[] {
  const importedElements: Import[] = [];
  visit(ast, "mdxjsEsm", (node: MdxjsEsm) => {
    if (node.data?.estree) {
      const estree = node.data.estree;

      // Process each statement in the ESM module
      for (const statement of estree.body) {
        // Look for import declarations
        if (statement.type === "ImportDeclaration") {
          // Process each import specifier
          for (const specifier of statement.specifiers) {
            if (specifier.type === "ImportDefaultSpecifier") {
              // Handle default imports like: import React from 'react'
              importedElements.push({
                name: specifier.local.name,
                from: String(statement.source?.value),
              });
            } else if (specifier.type === "ImportSpecifier") {
              // Handle named imports like: import { useState as useStateAlias } from 'react'
              importedElements.push({
                name: specifier.local.name,
                from: String(statement.source?.value),
              });
            } else if (specifier.type === "ImportNamespaceSpecifier") {
              // Handle namespace imports like: import * as React from 'react'
              importedElements.push({
                name: specifier.local.name,
                from: String(statement.source?.value),
              });
            }
          }
        }
      }
    }
  });

  return importedElements;
}
