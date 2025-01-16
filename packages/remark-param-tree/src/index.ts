import type {
  Heading,
  ListItem,
  Paragraph,
  PhrasingContent,
  Root,
} from "mdast";
import { type MdxJsxTextElement } from "mdast-util-mdx";
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
        ): [node: MdxJsxTextElement, typeDefinition: TypeDefinition] | null => {
          const result = match(node)
            .with(
              {
                type: "heading",
              },
              (node) => [null, toString(node)] as const,
            )
            .with(
              {
                type: "listItem",
                children: [{ type: "paragraph" }, ...P.array()],
              },
              (node) =>
                [node.children.slice(1), toString(node.children[0])] as const,
            )
            .otherwise(() => null);
          if (result === null) return null;
          const [children, typeStr] = result;

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
                  {
                    type: "mdxJsxTextElement",
                    name: "ParamTree.Parameter",
                    attributes: [
                      { type: "mdxJsxAttribute", name: "ident", value: name },
                      { type: "mdxJsxAttribute", name: "type", value: type },
                    ],
                    children: children !== null ? children : [],
                    // children: [],
                  },
                  {
                    name,
                    type,
                    optional: Boolean(optional),
                  },
                ] satisfies [
                  node: MdxJsxTextElement,
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
          const [_node, typeDefinition] = _typeDefinition;
          parent.children.splice(index, 1, _node);
        };
        visit(node, "listItem", transformNode);
        visit(node, "heading", transformNode);
        return SKIP;
      }
      return;
    });
  };
}
