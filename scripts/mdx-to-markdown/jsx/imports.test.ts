import type { Root } from "mdast";
import { describe, expect, it } from "vitest";

import { collectAllImportedElementNames } from "./imports";

describe("collectAllImportedElementNames", () => {
  it("should return an empty set for an AST with no imports", () => {
    // Create a test AST with no imports
    const ast: Root = {
      type: "root",
      children: [
        {
          type: "paragraph",
          children: [
            {
              type: "text",
              value: "This is a paragraph with no imports",
            },
          ],
        },
      ],
    };

    // Call the function
    const result = collectAllImportedElementNames(ast);

    // Verify the result
    expect(result).toBeInstanceOf(Set);
    expect(result.size).toBe(0);
  });

  it("should collect default imports", () => {
    // Create a test AST with default imports
    const ast: Root = {
      type: "root",
      children: [
        {
          type: "mdxjsEsm",
          value: 'import React from "react";',
          data: {
            estree: {
              type: "Program",
              body: [
                {
                  type: "ImportDeclaration",
                  specifiers: [
                    {
                      type: "ImportDefaultSpecifier",
                      local: {
                        type: "Identifier",
                        name: "React",
                      },
                    },
                  ],
                  source: {
                    type: "Literal",
                    value: "react",
                    raw: '"react"',
                  },
                },
              ],
              sourceType: "module",
            },
          },
        },
      ],
    };

    // Call the function
    const result = collectAllImportedElementNames(ast);

    // Verify the result
    expect(result).toBeInstanceOf(Set);
    expect(result.size).toBe(1);
    expect(result.has("React")).toBe(true);
  });

  it("should collect named imports", () => {
    // Create a test AST with named imports
    const ast: Root = {
      type: "root",
      children: [
        {
          type: "mdxjsEsm",
          value: 'import { useState, useEffect } from "react";',
          data: {
            estree: {
              type: "Program",
              body: [
                {
                  type: "ImportDeclaration",
                  specifiers: [
                    {
                      type: "ImportSpecifier",
                      local: {
                        type: "Identifier",
                        name: "useState",
                      },
                      imported: {
                        type: "Identifier",
                        name: "useState",
                      },
                    },
                    {
                      type: "ImportSpecifier",
                      local: {
                        type: "Identifier",
                        name: "useEffect",
                      },
                      imported: {
                        type: "Identifier",
                        name: "useEffect",
                      },
                    },
                  ],
                  source: {
                    type: "Literal",
                    value: "react",
                    raw: '"react"',
                  },
                },
              ],
              sourceType: "module",
            },
          },
        },
      ],
    };

    // Call the function
    const result = collectAllImportedElementNames(ast);

    // Verify the result
    expect(result).toBeInstanceOf(Set);
    expect(result.size).toBe(2);
    expect(result.has("useState")).toBe(true);
    expect(result.has("useEffect")).toBe(true);
  });

  it("should collect renamed imports", () => {
    // Create a test AST with renamed imports
    const ast: Root = {
      type: "root",
      children: [
        {
          type: "mdxjsEsm",
          value: 'import { useState as useStateAlias } from "react";',
          data: {
            estree: {
              type: "Program",
              body: [
                {
                  type: "ImportDeclaration",
                  specifiers: [
                    {
                      type: "ImportSpecifier",
                      local: {
                        type: "Identifier",
                        name: "useStateAlias",
                      },
                      imported: {
                        type: "Identifier",
                        name: "useState",
                      },
                    },
                  ],
                  source: {
                    type: "Literal",
                    value: "react",
                    raw: '"react"',
                  },
                },
              ],
              sourceType: "module",
            },
          },
        },
      ],
    };

    // Call the function
    const result = collectAllImportedElementNames(ast);

    // Verify the result
    expect(result).toBeInstanceOf(Set);
    expect(result.size).toBe(1);
    expect(result.has("useStateAlias")).toBe(true);
  });

  it("should collect namespace imports", () => {
    // Create a test AST with namespace imports
    const ast: Root = {
      type: "root",
      children: [
        {
          type: "mdxjsEsm",
          value: 'import * as ReactAll from "react";',
          data: {
            estree: {
              type: "Program",
              body: [
                {
                  type: "ImportDeclaration",
                  specifiers: [
                    {
                      type: "ImportNamespaceSpecifier",
                      local: {
                        type: "Identifier",
                        name: "ReactAll",
                      },
                    },
                  ],
                  source: {
                    type: "Literal",
                    value: "react",
                    raw: '"react"',
                  },
                },
              ],
              sourceType: "module",
            },
          },
        },
      ],
    };

    // Call the function
    const result = collectAllImportedElementNames(ast);

    // Verify the result
    expect(result).toBeInstanceOf(Set);
    expect(result.size).toBe(1);
    expect(result.has("ReactAll")).toBe(true);
  });

  it("should collect mixed import types", () => {
    // Create a test AST with mixed import types
    const ast: Root = {
      type: "root",
      children: [
        {
          type: "mdxjsEsm",
          value:
            'import React, { useState, useEffect as useEffectAlias } from "react";\nimport * as ReactDOM from "react-dom";',
          data: {
            estree: {
              type: "Program",
              body: [
                {
                  type: "ImportDeclaration",
                  specifiers: [
                    {
                      type: "ImportDefaultSpecifier",
                      local: {
                        type: "Identifier",
                        name: "React",
                      },
                    },
                    {
                      type: "ImportSpecifier",
                      local: {
                        type: "Identifier",
                        name: "useState",
                      },
                      imported: {
                        type: "Identifier",
                        name: "useState",
                      },
                    },
                    {
                      type: "ImportSpecifier",
                      local: {
                        type: "Identifier",
                        name: "useEffectAlias",
                      },
                      imported: {
                        type: "Identifier",
                        name: "useEffect",
                      },
                    },
                  ],
                  source: {
                    type: "Literal",
                    value: "react",
                    raw: '"react"',
                  },
                },
                {
                  type: "ImportDeclaration",
                  specifiers: [
                    {
                      type: "ImportNamespaceSpecifier",
                      local: {
                        type: "Identifier",
                        name: "ReactDOM",
                      },
                    },
                  ],
                  source: {
                    type: "Literal",
                    value: "react-dom",
                    raw: '"react-dom"',
                  },
                },
              ],
              sourceType: "module",
            },
          },
        },
      ],
    };

    // Call the function
    const result = collectAllImportedElementNames(ast);

    // Verify the result
    expect(result).toBeInstanceOf(Set);
    expect(result.size).toBe(4);
    expect(result.has("React")).toBe(true);
    expect(result.has("useState")).toBe(true);
    expect(result.has("useEffectAlias")).toBe(true);
    expect(result.has("ReactDOM")).toBe(true);
  });

  it("should handle multiple import statements", () => {
    // Create a test AST with multiple import statements
    const ast: Root = {
      type: "root",
      children: [
        {
          type: "mdxjsEsm",
          value:
            'import React from "react";\nimport { useState } from "react";\nimport * as ReactDOM from "react-dom";',
          data: {
            estree: {
              type: "Program",
              body: [
                {
                  type: "ImportDeclaration",
                  specifiers: [
                    {
                      type: "ImportDefaultSpecifier",
                      local: {
                        type: "Identifier",
                        name: "React",
                      },
                    },
                  ],
                  source: {
                    type: "Literal",
                    value: "react",
                    raw: '"react"',
                  },
                },
                {
                  type: "ImportDeclaration",
                  specifiers: [
                    {
                      type: "ImportSpecifier",
                      local: {
                        type: "Identifier",
                        name: "useState",
                      },
                      imported: {
                        type: "Identifier",
                        name: "useState",
                      },
                    },
                  ],
                  source: {
                    type: "Literal",
                    value: "react",
                    raw: '"react"',
                  },
                },
                {
                  type: "ImportDeclaration",
                  specifiers: [
                    {
                      type: "ImportNamespaceSpecifier",
                      local: {
                        type: "Identifier",
                        name: "ReactDOM",
                      },
                    },
                  ],
                  source: {
                    type: "Literal",
                    value: "react-dom",
                    raw: '"react-dom"',
                  },
                },
              ],
              sourceType: "module",
            },
          },
        },
      ],
    };

    // Call the function
    const result = collectAllImportedElementNames(ast);

    // Verify the result
    expect(result).toBeInstanceOf(Set);
    expect(result.size).toBe(3);
    expect(result.has("React")).toBe(true);
    expect(result.has("useState")).toBe(true);
    expect(result.has("ReactDOM")).toBe(true);
  });
});
