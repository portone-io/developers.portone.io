import { takeWhile } from "es-toolkit";
import Slugger from "github-slugger";
import type { Heading, List, ListItem, Root } from "mdast";
import { type MdxJsxFlowElement } from "mdast-util-mdx";
import { match, P } from "ts-pattern";
import { type BuildVisitor, SKIP, visit } from "unist-util-visit";

import { transformListItemToTypeDef } from "./transform/typeDef.ts";

/**
 * ListItem 또는 이미 변환된 MdxJsxFlowElement가 섞여있는 배열에서,
 * MdxJsxFlowElement는 분리하고, 연속되는 ListItem만 List로 묶어서 반환
 *
 * 예) [JSX, JSX, ListItem, ListItem, ListItem, JSX]
 * => [JSX, JSX, List[ListItem, ListItem, ListItem], JSX]
 */
function groupItemsByType(
  node: List,
  items: (MdxJsxFlowElement | ListItem)[],
): (MdxJsxFlowElement | List)[] {
  if (items.length === 0) {
    return [];
  }

  const firstType = items[0]?.type;
  if (!firstType) {
    return [];
  }

  const chunk = match(takeWhile(items, (item) => item.type === firstType))
    .with(P.array({ type: "mdxJsxFlowElement" }), (chunk) => chunk)
    .with(P.array({ type: "listItem" }), (children) => [
      {
        ...node,
        children,
      } satisfies List,
    ])
    .otherwise(() => []);

  return [...chunk, ...groupItemsByType(node, items.slice(chunk.length))];
}

export default function remarkParamTreePlugin() {
  return function (tree: Root) {
    const slugger = new Slugger();
    visit(tree, "mdxJsxFlowElement", (node) => {
      if (node.name === "Parameter") {
        const transformNode: (
          ...params: Parameters<BuildVisitor<MdxJsxFlowElement, "list">>
        ) => void = (node, index, parent) => {
          if (node.children.every((child) => child.type === "listItem")) {
            return;
          }
          parent?.children.splice(
            index ?? 0,
            1,
            ...groupItemsByType(node, node.children),
          );
        };
        visit(node, "listItem", transformListItemToTypeDef);
        visit(node, "list", transformNode);
        const heading = Number(
          node.attributes.find(
            (attr) =>
              attr.type === "mdxJsxAttribute" && attr.name === "heading",
          ),
        );
        match(heading).with(P.union(1, 2, 3, 4, 5, 6), (depth) => {
          node.children = node.children.flatMap((child) => {
            if (
              child.type === "mdxJsxFlowElement" &&
              child.name === "Parameter.TypeDef"
            ) {
              return [
                {
                  type: "mdxJsxFlowElement",
                  name: `h${depth}` as const,
                  attributes: [
                    {
                      type: "mdxJsxAttribute",
                      name: "id",
                      value: slugger.slug(toString(child)),
                    },
                  ],
                } satisfies MdxJsxFlowElement,
              ];
            }
            return [child];
          });
        });
        return SKIP;
      }
      return;
    });
  };
}
