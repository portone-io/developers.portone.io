import type { Code, Root } from "mdast";
import { format, type FormatConfig } from "oxfmt";
import { lintRule } from "unified-lint-rule";
import { visit } from "unist-util-visit";

export interface Options {
  /** 코드 블록 포맷에 사용할 oxfmt 옵션 */
  formatOptions?: FormatConfig;
}

/** 코드 블록 언어 → oxfmt가 언어를 추론할 파일 확장자 */
const LANG_TO_EXT: Record<string, string> = {
  ts: "ts",
  typescript: "ts",
  tsx: "tsx",
  js: "js",
  javascript: "js",
  json: "json",
  html: "html",
  css: "css",
  graphql: "graphql",
};

export function getCodeBlockExtension(lang: string | null | undefined) {
  return lang ? LANG_TO_EXT[lang] : undefined;
}

export const remarkLintCodeBlockFormat = lintRule<Root, Options | undefined>(
  "remark-lint:code-block-format",
  async (tree, file, options) => {
    const codeNodes: { node: Code; ext: string }[] = [];
    visit(tree, "code", (node) => {
      const ext = getCodeBlockExtension(node.lang);
      if (ext) codeNodes.push({ node, ext });
    });

    await Promise.all(
      codeNodes.map(async ({ node, ext }) => {
        const result = await format(
          `code-block.${ext}`,
          node.value,
          options?.formatOptions,
        );
        if (result.errors.length > 0) {
          const reason = result.errors[0]?.message ?? "unknown error";
          file.message(`코드 블록을 파싱할 수 없습니다: ${reason}`, node);
          return;
        }
        const formatted = result.code.replace(/\n$/, "");
        if (formatted !== node.value) {
          const message = file.message(
            "코드 블록이 포맷되어 있지 않습니다",
            node,
          );
          message.actual = node.value;
          message.expected = [formatted];
        }
      }),
    );
  },
);
