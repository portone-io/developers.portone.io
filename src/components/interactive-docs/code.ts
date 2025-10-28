import { match, P } from "ts-pattern";

import type { PayMethod } from "~/state/interactive-docs";
import type { PaymentGateway } from "~/type";

type CodeForPreview<Sections extends string> = Readonly<{
  code: string;
  sections: Partial<Record<Sections, Section>>;
}>;

export type Section = Readonly<{
  startLine: number;
  endLine: number;
}>;

export type DefaultParams = {
  payMethod: PayMethod;
};

type Primitive = string | number | false | null | undefined;

type Interpolation<Params extends DefaultParams, Sections extends string> =
  | GenerateCode<Params, Sections>
  | Primitive
  | readonly NoInfer<Interpolation<Params, Sections>>[];

export type CodeResult<Sections extends string> = Partial<{
  code: string;
  sections: Partial<Record<Sections, Section>>;
}>;

export type CodeFunction<Params extends DefaultParams, Result> = (
  params: Params,
  pgName: () => PaymentGateway,
) => Result;

type CodeTemplateFunction<
  Params extends DefaultParams,
  Sections extends string,
> = (
  codes: TemplateStringsArray,
  ...interpolations: readonly Interpolation<Params, Sections>[]
) => CodeFunction<Params, CodeResult<Sections>>;

type CodeHelpers<
  Params extends DefaultParams,
  Sections extends string,
> = Readonly<{
  section: (sectionName: Sections) => CodeTemplateFunction<Params, Sections>;
  when: (
    predicate: (params: Params) => boolean,
  ) => CodeTemplateFunction<Params, Sections>;
  params: Params;
  pgName: () => PaymentGateway;
  indentObject: (obj: unknown) => string;
}>;

type GenerateCode<Params extends DefaultParams, Sections extends string> = (
  helpers: CodeHelpers<Params, Sections>,
) => CodeFunction<Params, CodeResult<Sections>> | string;

const countLines = (text: string): number =>
  (text.match(/\n/g)?.length ?? 0) + 1;

/**
 * 코드 문자열에서 마지막 비어있지 않은 줄의 들여쓰기를 분석합니다.
 * 코드 생성 시 현재 들여쓰기 컨텍스트를 유지하고 객체를 적절하게 포맷팅하기 위해 사용됩니다.
 * @param code 분석할 코드 문자열
 * @returns 감지된 들여쓰기 문자열 (공백 또는 탭)
 */
const detectIndentation = (code: string): string => {
  if (!code) return "";

  const lines = code.split("\n");

  // 비어있지 않은 마지막 줄을 찾습니다.
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i];
    if (line?.trim()) {
      return line.match(/^(\s+)/)?.[1] ?? "";
    }
  }

  return "";
};

class CodeGenerator<Params extends DefaultParams, Sections extends string> {
  codeString = "";
  sections: Partial<Record<Sections, Section>> = {};
  currentLine = 1;
  currentIndentation = "";

  private readonly params: Params;
  private readonly pgName: () => PaymentGateway;

  constructor(params: Params, pgName: () => PaymentGateway) {
    this.params = params;
    this.pgName = pgName;
  }

  generate(
    codes: TemplateStringsArray,
    interpolations: readonly Interpolation<Params, Sections>[],
  ): void {
    const trimmedCodes = trimCodes(codes);
    for (let i = 0; i < trimmedCodes.length; i++) {
      this.append(trimmedCodes[i]!);

      if (i < interpolations.length) {
        this.processInterpolation(interpolations[i]);
      }
    }
  }

  append(text: string): void {
    this.codeString += text;
    this.currentLine += countLines(text) - 1;
  }

  removeLastLine(): void {
    const reLastLine = /\n[^\n]*$/;
    const matches = reLastLine.exec(this.codeString);
    if (matches) {
      this.currentLine -= 1;
      this.codeString = this.codeString.slice(0, matches.index);
    }
  }

  getCurrentIndentation(): string {
    if (!this.currentIndentation) {
      this.currentIndentation = detectIndentation(this.codeString);
    }
    return this.currentIndentation;
  }
  processInterpolation(interpolation: Interpolation<Params, Sections>): void {
    match(interpolation)
      .with(P.string, (str) => {
        this.append(str);
      })
      .with(P.number, (num) => {
        this.append(String(num));
      })
      .with(P.array(), (arr) => {
        arr.forEach((item) => this.processInterpolation(item));
      })
      .with(P.nullish, false, () => {})
      .with(
        P.when(
          (fn): fn is GenerateCode<Params, Sections> =>
            typeof fn === "function",
        ),
        (fn) => {
          const result = fn(this.getHelpers());
          if (typeof result === "function") {
            const { code, sections = {} } = result(this.params, this.pgName);
            if (code) {
              this.append(code);
            }
            Object.assign(this.sections, sections);
          } else {
            this.append(result);
          }
        },
      )
      .exhaustive();
  }

  getHelpers(): CodeHelpers<Params, Sections> {
    return {
      section: this.sectionResolver(),
      when: this.whenResolver(),
      params: this.params,
      pgName: this.pgName,
      indentObject: this.indentObjectResolver(),
    } as const;
  }

  sectionResolver(): CodeHelpers<Params, Sections>["section"] {
    return (sectionName) =>
      (codes, ...interpolations) =>
      (params, pgName) => {
        const startLine = this.currentLine;

        const generator = new CodeGenerator<Params, Sections>(params, pgName);
        generator.currentLine = startLine;
        generator.currentIndentation = this.getCurrentIndentation();
        generator.generate(codes, interpolations);

        const endLine = generator.currentLine;
        this.sections[sectionName] = { startLine, endLine };

        return { code: generator.codeString, sections: generator.sections };
      };
  }

  whenResolver(): CodeHelpers<Params, Sections>["when"] {
    return (predicate) =>
      (codes, ...interpolations) =>
      (params, pgName) => {
        if (predicate(params)) {
          const generator = new CodeGenerator<Params, Sections>(params, pgName);
          generator.currentLine = this.currentLine;
          generator.currentIndentation = this.getCurrentIndentation();
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
   * ${({ params, indentObject }) =>
   *   indentObject(createPaymentRequest(params, "123"))}
   * ```
   *
   * @param obj 변환할 객체
   * @returns 현재 들여쓰기 컨텍스트에 맞게 포맷팅된 문자열
   */
  indentObjectResolver(): (obj: unknown) => string {
    return (obj) => {
      const currentIndent = this.getCurrentIndentation();
      const indentChar = currentIndent.startsWith("\t") ? "\t" : " ";
      const indentStep = 2;

      const getIndentation = (level: number): string =>
        `${currentIndent}${indentChar.repeat(level * indentStep)}`;

      const stringifyValue = (value: unknown, level: number): string => {
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
          return stringifyObject(value as Record<string, unknown>, level);
        }

        return JSON.stringify(value);
      };

      const stringifyObject = (
        obj: Record<string, unknown>,
        level: number,
      ): string => {
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
      };

      return stringifyValue(obj, 0);
    };
  }
}

const trimCodes = (codes: TemplateStringsArray): readonly string[] => {
  const [first, ...rest] = codes;
  const last = rest.pop();

  if (first && last !== undefined) {
    return [first.trimStart(), ...rest, last.trimEnd()] as const;
  }

  return [first?.trim() ?? "", ...rest] as const;
};

export type Code<
  Params extends DefaultParams,
  Sections extends string,
> = CodeFunction<Params, CodeForPreview<Sections>>;

export const code = <T extends { params: DefaultParams; sections: string }>(
  codes: TemplateStringsArray,
  ...interpolations: readonly Interpolation<T["params"], T["sections"]>[]
): Code<T["params"], T["sections"]> => {
  return (params, pgName) => {
    const generator = new CodeGenerator<T["params"], T["sections"]>(
      params,
      pgName,
    );
    generator.generate(codes, interpolations);
    return { code: generator.codeString, sections: generator.sections };
  };
};
