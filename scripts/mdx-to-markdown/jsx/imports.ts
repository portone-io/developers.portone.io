import type { MdxjsEsm } from "mdast-util-mdx";
import type { Node } from "unist";
import { visit } from "unist-util-visit";

/**
 * Collects all imported element names from the MDX AST
 * @param ast MDX AST
 * @returns Set of imported element names
 */
export function collectAllImportedElementNames(ast: Node): Set<string> {
  const importedElementNames = new Set<string>();
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
              importedElementNames.add(specifier.local.name);
            } else if (specifier.type === "ImportSpecifier") {
              // Handle named imports like: import { useState as useStateAlias } from 'react'
              importedElementNames.add(specifier.local.name);
            } else if (specifier.type === "ImportNamespaceSpecifier") {
              // Handle namespace imports like: import * as React from 'react'
              importedElementNames.add(specifier.local.name);
            }
          }
        }
      }
    }
  });

  return importedElementNames;
}
