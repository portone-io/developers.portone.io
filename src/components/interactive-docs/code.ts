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
};

type GenerateCode<Params extends DefaultParams, Sections extends string> = (
  helpers: CodeHelpers<Params, Sections>,
) => CodeFunction<Params, CodeResult<Sections>>;

function countLines(text: string): number {
  return (text.match(/\n/g)?.length ?? 0) + 1;
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

  processInterpolation(interpolation: Interpolation<Params, Sections>) {
    if (typeof interpolation === "function") {
      const { code, sections } = interpolation(this.getHelpers())(this.params);
      if (code) {
        this.append(code);
      }
      Object.assign(this.sections, sections);
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
