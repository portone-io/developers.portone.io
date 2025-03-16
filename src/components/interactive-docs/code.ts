import type { PayMethod, Pg } from "~/state/interactive-docs";

type CodeForPreview<Sections extends string> = {
  code: string;
  sections: Partial<Record<Sections, Section>>;
};

export type Section = {
  startLine: number;
  endLine: number;
};

export type DefaultParams = {
  pg: {
    name: Pg;
    payMethods: PayMethod;
  };
};

type Primitive = string | number | boolean | null | undefined;

type Interpolation<Params extends DefaultParams, Sections extends string> =
  | GenerateCode<Params, Sections>
  | Primitive
  | Interpolation<Params, Sections>[];

export type CodeResult<Sections extends string> = Partial<{
  code: string;
  sections: Partial<Record<Sections, Section>>;
}>;

export type CodeFunction<Params extends DefaultParams, Result> = (
  params: Params,
) => Result;

type CodeTemplateFunction<
  Params extends DefaultParams,
  Sections extends string,
> = (
  codes: TemplateStringsArray,
  ...interpolations: Interpolation<Params, Sections>[]
) => CodeFunction<Params, CodeResult<Sections>>;

type CodeHelpers<Params extends DefaultParams, Sections extends string> = {
  section: (sectionName: Sections) => CodeTemplateFunction<Params, Sections>;
  when: (
    predicate: (params: Params) => boolean,
  ) => CodeTemplateFunction<Params, Sections>;
  params: Params;
  indentObject: (obj: unknown) => string;
};

type GenerateCode<Params extends DefaultParams, Sections extends string> = (
  helpers: CodeHelpers<Params, Sections>,
) => CodeFunction<Params, CodeResult<Sections>> | string;

function countLines(text: string): number {
  return (text.match(/\n/g)?.length ?? 0) + 1;
}

/**
 * 코드 문자열에서 마지막 비어있지 않은 줄의 들여쓰기를 분석합니다.
 * 코드 생성 시 현재 들여쓰기 컨텍스트를 유지하고 객체를 적절하게 포맷팅하기 위해 사용됩니다.
 * @param code 분석할 코드 문자열
 * @returns 감지된 들여쓰기 문자열 (공백 또는 탭)
 */
function detectIndentation(code: string): string {
  if (!code) return "";

  // 마지막 줄을 가져옵니다.
  const lines = code.split("\n");
  let lastLine = "";

  // 비어있지 않은 마지막 줄을 찾습니다.
  for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i]?.trim()) {
      lastLine = lines[i] || "";
      break;
    }
  }

  // 들여쓰기를 추출합니다.
  const indentMatch = lastLine.match(/^(\s+)/);
  return indentMatch?.[1] || "";
}

class CodeGenerator<Params extends DefaultParams, Sections extends string> {
  codeString = "";
  sections: Partial<Record<Sections, Section>> = {};
  currentLine = 1;
  params: Params;

  constructor(params: Params) {
    this.params = params;
  }

  generate(
    codes: TemplateStringsArray,
    interpolations: Interpolation<Params, Sections>[],
  ) {
    const trimmedCodes = trimCodes(codes);
    for (let i = 0; i < trimmedCodes.length; i++) {
      const literal = trimmedCodes[i]!;
      this.append(literal);

      if (i < interpolations.length) {
        const interpolation = interpolations[i]!;
        this.processInterpolation(interpolation);
      }
    }
  }

  append(text: string) {
    this.codeString += text;
    this.currentLine += countLines(text) - 1;
  }

  removeLastLine() {
    const reLastLine = /\n[^\n]*$/;
    const matches = reLastLine.exec(this.codeString);
    if (matches) {
      this.currentLine -= 1;
      this.codeString = this.codeString.slice(0, matches.index);
    }
  }

  getCurrentIndentation(): string {
    return detectIndentation(this.codeString);
  }

  processInterpolation(interpolation: Interpolation<Params, Sections>) {
    if (typeof interpolation === "function") {
      const result = interpolation(this.getHelpers());
      if (typeof result === "function") {
        const { code, sections = {} } = result(this.params);
        if (code) {
          this.append(code);
        }
        Object.assign(this.sections, sections);
      } else {
        this.append(result);
      }
    } else if (Array.isArray(interpolation)) {
      for (const item of interpolation) {
        this.processInterpolation(item);
      }
    } else if (interpolation != null && interpolation !== false) {
      this.append(String(interpolation));
    }
  }

  getHelpers(): CodeHelpers<Params, Sections> {
    return {
      section: this.sectionResolver(),
      when: this.whenResolver(),
      params: this.params,
      indentObject: this.indentObjectResolver(),
    };
  }

  sectionResolver(): CodeHelpers<Params, Sections>["section"] {
    return (sectionName) =>
      (codes, ...interpolations) =>
      (params) => {
        const startLine = this.currentLine;

        const generator = new CodeGenerator<Params, Sections>(params);
        generator.currentLine = startLine;
        generator.generate(codes, interpolations);

        const endLine = generator.currentLine;
        this.sections[sectionName] = { startLine, endLine };

        return { code: generator.codeString, sections: generator.sections };
      };
  }

  whenResolver(): CodeHelpers<Params, Sections>["when"] {
    return (predicate) =>
      (codes, ...interpolations) =>
      (params) => {
        if (predicate(params)) {
          const generator = new CodeGenerator<Params, Sections>(params);
          generator.currentLine = this.currentLine;
          generator.generate(codes, interpolations);

          return { code: generator.codeString, sections: generator.sections };
        }
        this.removeLastLine();
        return {};
      };
  }

  /**
   * 객체를 현재 들여쓰기 컨텍스트에 맞게 포맷팅된 문자열로 변환합니다.
   *
   * 예시:
   * ```
   * function example() {
   *   const config = ${({ indentObject }) => indentObject({
   *     // 객체는 자동으로 현재 들여쓰기 레벨에 맞게 포맷팅됩니다.
   *     name: "포트원",
   *     settings: { enabled: true }
   *   })}
   * }
   * ```
   *
   * @param obj 변환할 객체
   * @returns 현재 들여쓰기 컨텍스트에 맞게 포맷팅된 문자열
   */
  indentObjectResolver(): (obj: unknown) => string {
    return (obj) => {
      // 현재 들여쓰기를 감지합니다.
      const currentIndent = this.getCurrentIndentation();

      // 들여쓰기 문자를 결정합니다 (공백 또는 탭)
      const indentChar = currentIndent.startsWith("\t") ? "\t" : " ";

      // 추가 들여쓰기에 사용할 간격 (기본 2칸)
      const indentStep = 2;

      function getIndentation(level: number): string {
        return currentIndent + indentChar.repeat(level * indentStep);
      }

      function stringifyValue(value: unknown, level: number): string {
        if (value === null) return "null";
        if (value === undefined) return "undefined";

        if (typeof value === "string") {
          return `"${value.replace(/"/g, '\\"')}"`;
        }

        if (typeof value === "number" || typeof value === "boolean") {
          return String(value);
        }

        if (Array.isArray(value)) {
          if (value.length === 0) return "[]";

          const itemIndent = getIndentation(level + 1);
          const closingIndent = getIndentation(level);

          const items = value
            .map((item) => `${itemIndent}${stringifyValue(item, level + 1)}`)
            .join(",\n");

          return `[\n${items},\n${closingIndent}]`;
        }

        if (typeof value === "object" && value !== null) {
          const objValue = value as Record<string, unknown>;
          return stringifyObject(objValue, level);
        }

        return JSON.stringify(value);
      }

      function stringifyObject(
        obj: Record<string, unknown>,
        level: number,
      ): string {
        if (!obj || Object.keys(obj).length === 0) return "{}";

        const keyIndent = getIndentation(level + 1);
        const closingIndent = getIndentation(level);

        const entries = Object.entries(obj)
          .map(([key, value]) => {
            const formattedValue = stringifyValue(value, level + 1);
            return `${keyIndent}${key}: ${formattedValue}`;
          })
          .join(",\n");

        return `{\n${entries},\n${closingIndent}}`;
      }

      return stringifyValue(obj, 0);
    };
  }
}

function trimCodes(codes: TemplateStringsArray): readonly string[] {
  const [first, ...rest] = codes;
  const last = rest.pop();
  if (first && last !== undefined) {
    return [first.trimStart(), ...rest, last.trimEnd()];
  }
  return [first?.trim() ?? "", ...rest];
}

export type Code<
  Params extends DefaultParams,
  Sections extends string,
> = CodeFunction<Params, CodeForPreview<Sections>>;

export function code<T extends { params: DefaultParams; sections: string }>(
  codes: TemplateStringsArray,
  ...interpolations: Interpolation<T["params"], T["sections"]>[]
): Code<T["params"], T["sections"]> {
  return (params) => {
    const generator = new CodeGenerator<T["params"], T["sections"]>(params);
    generator.generate(codes, interpolations);
    return { code: generator.codeString, sections: generator.sections };
  };
}
