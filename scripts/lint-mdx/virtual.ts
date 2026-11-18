import type { Program } from "estree";
import type { Code, Root } from "mdast";
import type {} from "mdast-util-mdx";
import { visit } from "unist-util-visit";

/**
 * MDX의 ESM, 표현식, JSX 컴포넌트 참조만 남긴 가상 JSX 소스를 만듭니다.
 *
 * 나머지 문자는 공백으로 채우고 줄바꿈은 유지하므로, 가상 소스의 오프셋과 줄/열이
 * 원본 MDX와 그대로 일치합니다. oxlint의 `no-undef`/`no-unused-vars`로
 * import하지 않은 컴포넌트나 사용하지 않는 import를 찾기 위해 사용합니다.
 */
export function buildScopeSource(tree: Root, source: string): string {
  const buffer = source.split("").map((ch) => (ch === "\n" ? "\n" : " "));
  const written = new Uint8Array(source.length);

  const isFree = (index: number) =>
    index >= 0 &&
    index < source.length &&
    source[index] !== "\n" &&
    written[index] === 0;
  const write = (index: number, text: string) => {
    buffer[index] = text;
    written[index] = 1;
  };
  const copy = (start: number, end: number) => {
    for (let i = start; i < end; i++) write(i, source[i] ?? " ");
  };
  /** 직전 구문과 이어지지 않도록 `[start, end)` 범위를 `;(...)`로 감싸 복사합니다. */
  const wrap = (start: number, end: number) => {
    let open = start - 1;
    while (open >= 0 && !isFree(open)) {
      if (written[open]) return false;
      open--;
    }
    let close = end;
    while (close < source.length && !isFree(close)) {
      if (written[close]) return false;
      close++;
    }
    if (open < 0 || close >= source.length) return false;
    let semicolon = open - 1;
    while (semicolon >= 0 && !isFree(semicolon) && !written[semicolon]) {
      semicolon--;
    }
    if (isFree(semicolon)) write(semicolon, ";");
    write(open, "(");
    copy(start, end);
    write(close, ")");
    return true;
  };
  const wrapExpressions = (program: Program | null | undefined) => {
    for (const statement of program?.body ?? []) {
      if (statement.type !== "ExpressionStatement") continue;
      const expression = statement.expression;
      if (
        expression.type === "ObjectExpression" &&
        expression.properties[0]?.type === "SpreadElement"
      ) {
        // `{...props}` 형태의 JSX spread 속성
        const range = expression.properties[0].argument.range;
        if (range) wrap(range[0], range[1]);
      } else if (expression.range) {
        wrap(expression.range[0], expression.range[1]);
      }
    }
  };

  visit(tree, (node) => {
    switch (node.type) {
      case "mdxjsEsm": {
        const { start, end } = node.position ?? {};
        if (start?.offset != null && end?.offset != null) {
          copy(start.offset, end.offset);
        }
        break;
      }
      case "mdxFlowExpression":
      case "mdxTextExpression":
        wrapExpressions(node.data?.estree);
        break;
      case "mdxJsxFlowElement":
      case "mdxJsxTextElement": {
        const start = node.position?.start.offset;
        if (node.name && start != null && isComponentName(node.name)) {
          const nameStart = source.indexOf(node.name, start);
          if (nameStart !== -1) wrap(nameStart, nameStart + node.name.length);
        }
        for (const attribute of node.attributes) {
          if (attribute.type === "mdxJsxExpressionAttribute") {
            wrapExpressions(attribute.data?.estree);
          } else if (
            attribute.value != null &&
            typeof attribute.value === "object"
          ) {
            wrapExpressions(attribute.value.data?.estree);
          }
        }
        break;
      }
    }
  });

  return buffer.join("");
}

/** 소문자로 시작하는 단일 이름(`div`)은 HTML 태그이므로 참조로 보지 않습니다. */
function isComponentName(name: string) {
  if (name.includes(":")) return false;
  return name.includes(".") || /^[A-Z_$]/.test(name);
}

export interface LintableCodeBlock {
  node: Code;
  ext: "ts" | "tsx";
}

const LINTABLE_LANGS: Record<string, LintableCodeBlock["ext"]> = {
  ts: "ts",
  typescript: "ts",
  tsx: "tsx",
};

/** oxlint로 검사할 TypeScript 코드 블록을 모읍니다. */
export function collectLintableCodeBlocks(tree: Root): LintableCodeBlock[] {
  const blocks: LintableCodeBlock[] = [];
  visit(tree, "code", (node) => {
    const ext = node.lang ? LINTABLE_LANGS[node.lang] : undefined;
    if (ext) blocks.push({ node, ext });
  });
  return blocks;
}
