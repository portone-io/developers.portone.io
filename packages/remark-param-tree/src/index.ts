import "mdast-util-mdx-jsx";

import path from "node:path";

import type { BlockContent, DefinitionContent, Paragraph, Root } from "mdast";
import { fromMarkdown } from "mdast-util-from-markdown";
import { toString } from "mdast-util-to-string";
import { match, P } from "ts-pattern";
import { SKIP, visit } from "unist-util-visit";
import type { VFile } from "vfile";

const isParameter = (node: BlockContent | DefinitionContent) => {};

type TypeDefinition = {
  name: string;
  type: string;
  optional: boolean;
};

export default function remarkParamTreePlugin() {
  return function (tree: Root, file: VFile) {};
}
