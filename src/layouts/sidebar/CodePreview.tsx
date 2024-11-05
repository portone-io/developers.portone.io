import { type JSXElement } from "solid-js";
import { Portal } from "solid-js/web";

interface Props {
  children?: JSXElement;
}

export type CodeForPreview<FileName extends string, Sections extends string> = {
  fileName: FileName;
  code: string;
  sections: Partial<Record<Sections, Section>>;
};

declare const __phantom: unique symbol;
export type FileDefinition<T> = {
  fileName: string;
} & { [__phantom]: T };

export type Section = {
  startLine: number;
  endLine: number;
};

type Primitive = string | number | boolean | null | undefined;

type Interpolation<Params extends object, Sections extends string> =
  | GenerateCode<Params, Sections>
  | Primitive
  | Interpolation<Params, Sections>[];

type CodeResult<Sections extends string> = Partial<{
  code: string;
  sections: Partial<Record<Sections, Section>>;
}>;

type CodeFunction<Params extends object, Result> = (params: Params) => Result;

type CodeTemplateFunction<Params extends object, Sections extends string> = (
  codes: TemplateStringsArray,
  ...interpolations: Interpolation<Params, Sections>[]
) => CodeFunction<Params, CodeResult<Sections>>;

type CodeHelpers<Params extends object, Sections extends string> = {
  section: (sectionName: Sections) => CodeTemplateFunction<Params, Sections>;
  when: (
    predicate: (params: Params) => boolean,
  ) => CodeTemplateFunction<Params, Sections>;
};

type GenerateCode<Params extends object, Sections extends string> = (
  helpers: CodeHelpers<Params, Sections>,
) => CodeFunction<Params, CodeResult<Sections>>;

function countLines(text: string): number {
  return (text.match(/\n/g)?.length ?? 0) + 1;
}

class CodeGenerator<Params extends object, Sections extends string> {
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
      code && this.append(code);
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

function code<Params extends object, Sections extends string>(
  codes: TemplateStringsArray,
  ...interpolations: Interpolation<Params, Sections>[]
): CodeFunction<Params, CodeResult<Sections>> {
  return (params) => {
    const generator = new CodeGenerator<Params, Sections>(params);
    generator.generate(codes, interpolations);
    return { code: generator.codeString, sections: generator.sections };
  };
}

function trimCodes(codes: TemplateStringsArray): readonly string[] {
  const [first, ...rest] = codes;
  const last = rest.pop();
  if (first && last !== undefined) {
    return [first.trimStart(), ...rest, last.trimEnd()];
  }
  return [first?.trim() ?? "", ...rest];
}

export function createPreviewFile<
  T extends { params: object; sections: string },
  Params extends T["params"],
  Sections extends T["sections"],
>(
  fileDef: FileDefinition<T>,
): (
  codes: TemplateStringsArray,
  ...interpolations: Interpolation<Params, Sections>[]
) => CodeFunction<
  Params,
  CodeForPreview<FileDefinition<T>["fileName"], Sections>
> {
  return (codes, ...interpolations) =>
    (params) => {
      const result = code<Params, Sections>(codes, ...interpolations)(params);
      return {
        code: result?.code ?? "",
        fileName: fileDef.fileName,
        sections: result?.sections ?? {},
      };
    };
}

export default function CodePreview(props: Props) {
  const ref: HTMLDivElement | undefined = undefined;
  return (
    <>
      <div>{props.children}</div>
      <Portal mount={document.getElementById("docs-right-sidebar")!} ref={ref}>
        <div class="w-133">todo</div>
      </Portal>
    </>
  );
}
