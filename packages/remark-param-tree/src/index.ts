import type {
  Heading,
  ListItem,
  Paragraph,
  PhrasingContent,
  Root,
} from "mdast";
import { toString } from "mdast-util-to-string";
import { match, P } from "ts-pattern";
import { type BuildVisitor, SKIP, visit } from "unist-util-visit";

type TypeDefinition = {
  name: string;
  type: string;
  optional: boolean;
};

export default function remarkParamTreePlugin() {
  return function (tree: Root) {
    visit(tree, "mdxJsxFlowElement", (node) => {
      if (node.name === "ParamTree") {
        const generateTypeDefinition = (
          node: ListItem | Heading,
        ):
          | [node: Heading | Paragraph, typeDefinition: TypeDefinition]
          | null => {
          const result = match(node)
            .with(
              {
                type: "heading",
              },
              (node) => [node, toString(node)] as const,
            )
            .with(
              {
                type: "listItem",
                children: [{ type: "paragraph" }, ...P.array()],
              },
              (node) => [node.children[0], toString(node.children[0])] as const,
            )
            .otherwise(() => null);
          if (result === null) return null;
          const [typeNode, typeStr] = result;

          const exec =
            /^(?<name>[a-zA-Z_$][a-zA-Z0-9_$]*)(?<optional>\?)?:\s*(?<type>[a-zA-Z0-9_$<>[\]{}|&?()\s]+)$/.exec(
              typeStr,
            );
          if (exec === null) {
            return null;
          }

          return match(exec.groups)
            .with(
              {
                name: P.string,
                type: P.string,
                optional: P.optional(P.string),
              },
              ({ name, type, optional }) =>
                [
                  typeNode,
                  {
                    name,
                    type,
                    optional: Boolean(optional),
                  },
                ] satisfies [
                  node: Heading | Paragraph,
                  typeDefinition: TypeDefinition,
                ],
            )
            .otherwise(() => null);
        };
        const transformNode: (
          ...params: Parameters<
            | BuildVisitor<typeof node, "listItem">
            | BuildVisitor<typeof node, "heading">
          >
        ) => void = (node, index, parent) => {
          if (index === undefined) return;
          if (parent === undefined) return;
          const _typeDefinition = generateTypeDefinition(node);
          if (_typeDefinition === null) return;
          const [, typeDefinition] = _typeDefinition;
          const typeMdast = [
            {
              type: "strong",
              children: [
                {
                  type: "inlineCode",
                  value: typeDefinition.name,
                },
              ],
            },
            { type: "text", value: " " },
            typeDefinition.optional === true && {
              type: "mdxJsxTextElement",
              name: "mark",
              attributes: [
                {
                  type: "mdxJsxAttribute",
                  name: "style",
                  value: "color:red;",
                },
              ],
              children: [
                {
                  type: "strong",
                  children: [{ type: "text", value: "*" }],
                },
              ],
            },
            typeDefinition.optional === true && { type: "text", value: " " },
            {
              type: "mdxJsxTextElement",
              name: "mark",
              attributes: [
                {
                  type: "mdxJsxAttribute",
                  name: "style",
                  value: "color:#1e293b;",
                },
              ],
              children: [
                {
                  type: "strong",
                  children: [{ type: "text", value: typeDefinition.type }],
                },
              ],
            },
          ].filter((node) => node !== false);
          match(node)
            .with(
              {
                type: "heading",
              },
              (node) => {
                node.children = typeMdast as PhrasingContent[];
              },
            )
            .with(
              {
                type: "listItem",
                children: [{ type: "paragraph" }, ...P.array()],
              },
              (node) => {
                node.children[0] = {
                  type: "paragraph",
                  children: typeMdast as PhrasingContent[],
                };
              },
            )
            .otherwise(() => {});
        };
        visit(node, "listItem", transformNode);
        visit(node, "heading", transformNode);
        return SKIP;
      }
      return;
    });
  };
}
