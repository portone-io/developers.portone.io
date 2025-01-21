import { takeWhile } from "es-toolkit";
import type { List, ListItem, Root } from "mdast";
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
        type: "list",
        ordered: false,
        spread: false,
        children,
      } satisfies List,
    ])
    .otherwise(() => []);

  return [...chunk, ...groupItemsByType(items.slice(chunk.length))];
}

export default function remarkParamTreePlugin() {
  return function (tree: Root) {
    visit(tree, "mdxJsxFlowElement", (node) => {
      if (node.name === "Parameter") {
        const transformNode: (
          ...params: Parameters<BuildVisitor<typeof node, "list">>
        ) => void = (node, index, parent) => {
          const typeDefs = groupItemsByType(
            node.children.map(transformListItemToTypeDef),
          );
          if (parent && index) {
            parent.children.splice(index, 1, ...typeDefs);
            return [SKIP, index + typeDefs.length];
          }
          return;
        };
        visit(node, "list", transformNode);
        return SKIP;
      }
      return;
    });
  };
}
