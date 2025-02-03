import type { List, ListItem } from "mdast";
import { toString } from "mdast-util-to-string";
import { match, P } from "ts-pattern";
import type { VisitorResult } from "unist-util-visit";

const TypeDefRegExp =
  /^(?<name>[a-zA-Z_$][a-zA-Z0-9_$(){}=]*)(?<optional>\?)?:\s*(?<type>[a-zA-Z0-9_$<>[\]{}|&?()\s]+)$/;

type TypeDef = {
  name: string;
  type: string;
  optional: boolean;
};

function parseTypeDef(str: string): TypeDef | null {
  return match(
    TypeDefRegExp.exec(str) as {
      groups?: {
        [key: string]: string;
      };
    } | null,
  )
    .with(
      {
        groups: P.select({
          name: P.string,
          type: P.string,
          optional: P.optional(P.string),
        }),
      },
      ({ name, type, optional }) => ({
        name,
        type,
        optional: !!optional,
      }),
    )
    .otherwise(() => null);
}

export function transformListItemToTypeDef(
  node: ListItem,
  index: number | undefined,
  parent: List | undefined,
): VisitorResult {
  match(node)
    .with(
      {
        type: "listItem",
        children: [{ type: "paragraph" }, ...P.array()],
      },
      ({ children }) => {
        const [paragraph, ...restChildren] = children;
        const typeDefText = toString(paragraph);

        const parsed = parseTypeDef(typeDefText);
        if (!parsed) return;

        const { name, type, optional } = parsed;
        parent?.children.splice(index ?? 0, 1, {
          type: "mdxJsxFlowElement",
          name: "Parameter.TypeDef",
          attributes: (
            [
              { type: "mdxJsxAttribute", name: "ident", value: name },
              { type: "mdxJsxAttribute", name: "type", value: type },
              optional &&
                ({
                  type: "mdxJsxAttribute",
                  name: "optional",
                  value: null,
                } as const),
            ] as const
          ).filter((x) => x !== false),
          children: restChildren,
        } as unknown as ListItem);
      },
    )
    .otherwise(() => {});
}
