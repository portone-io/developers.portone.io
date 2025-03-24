import type { Root } from "mdast";
import { describe, expect, it } from "vitest";

import { collectAllImportedElements } from "./imports";

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
    const result = collectAllImportedElements(ast);

    // Verify the result
    expect(result.length).toBe(0);
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
    const result = collectAllImportedElements(ast);

    // Verify the result
    expect(result.length).toBe(1);

    // Check if the array contains an object with the expected name and from properties
    const hasReact = result.some(
      (item) => item.name === "React" && item.from === "react",
    );
    expect(hasReact).toBe(true);
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
    const result = collectAllImportedElements(ast);

    // Verify the result
    expect(result.length).toBe(2);

    // Check if the array contains objects with the expected name and from properties
    const hasUseState = result.some(
      (item) => item.name === "useState" && item.from === "react",
    );
    const hasUseEffect = result.some(
      (item) => item.name === "useEffect" && item.from === "react",
    );
    expect(hasUseState).toBe(true);
    expect(hasUseEffect).toBe(true);
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
    const result = collectAllImportedElements(ast);

    // Verify the result
    expect(result.length).toBe(1);

    // Check if the set contains an object with the expected name and from properties
    const hasUseStateAlias = result.some(
      (item) => item.name === "useStateAlias" && item.from === "react",
    );
    expect(hasUseStateAlias).toBe(true);
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
    const result = collectAllImportedElements(ast);

    // Verify the result
    expect(result.length).toBe(1);

    // Check if the array contains an object with the expected name and from properties
    const hasReactAll = result.some(
      (item) => item.name === "ReactAll" && item.from === "react",
    );
    expect(hasReactAll).toBe(true);
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
    const result = collectAllImportedElements(ast);

    // Verify the result
    expect(result.length).toBe(4);

    // Check if the array contains objects with the expected name and from properties
    const hasReact = result.some(
      (item) => item.name === "React" && item.from === "react",
    );
    const hasUseState = result.some(
      (item) => item.name === "useState" && item.from === "react",
    );
    const hasUseEffectAlias = result.some(
      (item) => item.name === "useEffectAlias" && item.from === "react",
    );
    const hasReactDOM = result.some(
      (item) => item.name === "ReactDOM" && item.from === "react-dom",
    );

    expect(hasReact).toBe(true);
    expect(hasUseState).toBe(true);
    expect(hasUseEffectAlias).toBe(true);
    expect(hasReactDOM).toBe(true);
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
    const result = collectAllImportedElements(ast);

    // Verify the result
    expect(result.length).toBe(3);

    // Check if the array contains objects with the expected name and from properties
    const hasReact = result.some(
      (item) => item.name === "React" && item.from === "react",
    );
    const hasUseState = result.some(
      (item) => item.name === "useState" && item.from === "react",
    );
    const hasReactDOM = result.some(
      (item) => item.name === "ReactDOM" && item.from === "react-dom",
    );

    expect(hasReact).toBe(true);
    expect(hasUseState).toBe(true);
    expect(hasReactDOM).toBe(true);
  });
});
