import fs from "node:fs";
import path from "node:path";

import { camelCase, pascalCase } from "es-toolkit/string";
import { match, P } from "ts-pattern";

import { TypescriptWriter } from "./common.ts";
import { getResourceRef, type Parameter } from "./schema.ts";

function generateDescription({
  imports,
  basePath,
  filePath,
  description = "",
}: {
  imports: Set<string>;
  basePath: string;
  filePath: string;
  description?: string;
}) {
  const file = `${filePath}.description.mdx`;
  if (fs.existsSync(path.dirname(file)) === false) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
  }
  fs.writeFileSync(file, description);
  const componentName = pascalCase(
    `${path
      .relative(basePath, filePath)
      .split("/")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join("")}Description`,
  );

  imports.add(
    `import ${componentName} from "./${path.relative(basePath, file)}";`,
  );
  return { componentName };
}

function generateTypeDef({
  imports,
  basePath,
  parameterPath,
  parameter,
  ident,
  defaultExpanded,
}: {
  imports: Set<string>;
  basePath: string;
  parameterPath: string;
  ident?: string;
  parameter: Parameter;
  defaultExpanded?: boolean;
}): string {
  const writer = TypescriptWriter();

  if (parameter.type === "resourceRef") {
    const componentName = `${pascalCase(getResourceRef(parameter.$ref).replaceAll("/", "_"))}TypeDef`;
    imports.add(
      `import { TypeDef as ${componentName} } from "~/components/parameter/__generated__/${getResourceRef(parameter.$ref)}/index.ts";`,
    );

    writer.writeLine(`<${componentName}`);
    writer.indent();
    if (parameter.optional === true) {
      writer.writeLine("optional");
    }
    if (ident !== undefined) {
      writer.writeLine(`ident="${ident}"`);
    }
    writer.outdent();
    writer.writeLine("/>");

    return writer.content;
  }
  writer.writeLine("<Parameter.TypeDef");
  writer.indent();
  writer.writeLine(`type={<>${generateInlineType({ parameter, imports })}</>}`);
  if (parameter.optional === true) {
    writer.writeLine("optional");
  }
  if (ident !== undefined) {
    writer.writeLine(`ident="${ident}"`);
  }
  if (parameter.type === "enum" || defaultExpanded === false) {
    writer.writeLine(`defaultExpanded={false}`);
  }
  writer.outdent();
  writer.writeLine(">");
  writer.indent();
  if (parameter.description !== undefined) {
    const description = generateDescription({
      imports,
      basePath,
      filePath: parameterPath,
      description: parameter.description,
    });
    writer.writeLine(`<${description.componentName} />`);
  }
  writer.writeLine(
    generateTypeDetails({ parameter, imports, basePath, parameterPath }),
  );
  writer.outdent();
  writer.writeLine("</Parameter.TypeDef>");

  return writer.content;
}

function generateTypeDetails({
  imports,
  basePath,
  parameterPath,
  parameter,
}: {
  imports: Set<string>;
  basePath: string;
  parameterPath: string;
  parameter: Parameter;
}): string {
  const writer = TypescriptWriter();

  match(parameter)
    .with({ type: "array" }, (parameter) => {
      writer.writeLine(
        generateTypeDetails({
          imports,
          basePath,
          parameterPath: path.join(parameterPath, "items"),
          parameter: parameter.items,
        }),
      );
    })
    .with({ properties: P.nonNullable }, (parameter) => {
      writer.writeLine("<Parameter.Details>");
      writer.indent();
      for (const [propName, propValue] of Object.entries(
        parameter.properties,
      )) {
        writer.writeLine(
          generateTypeDef({
            ident: propName,
            basePath,
            imports,
            parameter: propValue,
            parameterPath: path.join(parameterPath, propName),
          }),
        );
      }
      writer.outdent();
      writer.writeLine("</Parameter.Details>");
    })
    .with({ type: "discriminatedUnion" }, (parameter) => {
      writer.writeLine("<Parameter.Details>");
      writer.indent();
      for (const [discriminateValue, propValue] of Object.entries(
        parameter.types,
      )) {
        const ident = camelCase(discriminateValue);
        writer.writeLine(
          generateTypeDef({
            ident,
            basePath,
            imports,
            parameter: {
              ...propValue,
              description: `\`${parameter.discriminator}\`가 \`${discriminateValue}\`인 경우에만 허용됩니다.\n\n`,
            },
            parameterPath: path.join(parameterPath, ident),
            defaultExpanded: false,
          }),
        );
      }
      writer.outdent();
      writer.writeLine("</Parameter.Details>");
    })
    .with({ type: "enum" }, (parameter) => {
      writer.writeLine("<Parameter.Details>");
      writer.indent();
      for (const [variantName, variant] of Object.entries(parameter.variants)) {
        if (variant.description !== undefined) {
          writer.writeLine(`<Parameter.TypeDef type='"${variantName}"'>`);
          writer.indent();
          const description = generateDescription({
            imports,
            basePath,
            filePath: path.join(parameterPath, variantName),
            description: variant.description,
          });
          writer.writeLine(`<${description.componentName} />`);
          writer.outdent();
          writer.writeLine("</Parameter.TypeDef>");
        } else {
          writer.writeLine(`<Parameter.TypeDef type="${variantName}" />`);
        }
      }
      writer.outdent();
      writer.writeLine("</Parameter.Details>");
    })
    .with({ type: "union" }, (parameter) => {
      writer.writeLine("<Parameter.Details>");
      writer.indent();
      parameter.types.forEach((type, index) => {
        writer.writeLine(
          generateTypeDef({
            basePath,
            imports,
            parameter: type,
            parameterPath: path.join(
              parameterPath,
              `${parameter.type}${index}`,
            ),
          }),
        );
      });
      writer.outdent();
      writer.writeLine("</Parameter.Details>");
    })
    .with({ type: "intersection" }, (parameter) => {
      parameter.types.forEach((type, index) => {
        writer.writeLine(
          generateTypeDetails({
            basePath,
            imports,
            parameter: type,
            parameterPath: path.join(
              parameterPath,
              `${parameter.type}${index}`,
            ),
          }),
        );
      });
    })
    .with({ type: "resourceRef" }, (parameter) => {
      const componentName = `${pascalCase(getResourceRef(parameter.$ref).replaceAll("/", "_"))}Details`;
      imports.add(
        `import { Details as ${componentName} } from "~/components/parameter/__generated__/${getResourceRef(parameter.$ref)}/index.ts";`,
      );
      writer.writeLine(`<${componentName} />`);
    })
    .with(
      { type: "string" },
      { type: "stringLiteral" },
      { type: "integer" },
      { type: "boolean" },
      { type: "emptyObject" },
      { type: "unknown" },
      () => {},
    )
    .exhaustive();

  return writer.content;
}

function generateInlineType({
  parameter,
  imports,
}: {
  parameter: Parameter;
  imports: Set<string>;
}): string {
  const writer = TypescriptWriter();
  match(parameter)
    .with(
      { type: "string" },
      { type: "integer" },
      { type: "boolean" },
      { type: "emptyObject" },
      { type: "unknown" },
      (param) => {
        const typeMap = {
          string: "string",
          integer: "number",
          boolean: "boolean",
          emptyObject: "object",
          unknown: "any",
        };
        writer.writeLine(
          `<ParameterType>${typeMap[param.type]}</ParameterType>`,
        );
      },
    )
    .with({ type: "stringLiteral" }, ({ value }) => {
      writer.writeLine(`<ParameterType>"${value}"</ParameterType>`);
    })
    .with({ type: "array" }, (parameter) => {
      writer.writeLine("<ParameterType>");
      writer.indent();
      writer.writeLine(`<span class="text-purple-5">Array</span>`);
      writer.writeLine(`<span class="text-slate-5">&lt;</span>`);
      writer.writeLine(
        generateInlineType({
          imports,
          parameter: parameter.items,
        }),
      );
      writer.writeLine(`<span class="text-slate-5">&gt;</span>`);
      writer.outdent();
      writer.writeLine("</ParameterType>");
    })
    .with({ type: "object" }, (parameter) => {
      writer.writeLine("<ParameterType>");
      writer.indent();
      writer.writeLine("<span class='text-purple-5'>&#123; </span>");
      writer.writeLine(
        Object.keys(parameter.properties)
          .slice(0, 3)
          .map((propName) => {
            return `<span class="text-purple-5">${propName}</span>\n`;
          })
          .join(`<span class="text-slate-5">{", "}</span>\n`),
      );
      if (Object.keys(parameter.properties).length > 3) {
        writer.writeLine(`<span class="text-slate-5">{", ..."}</span>`);
      }
      writer.writeLine("<span class='text-purple-5'> &#125;</span>");
      writer.outdent();
      writer.writeLine("</ParameterType>");
    })
    .with({ type: "enum" }, (parameter) => {
      const variantNames = Object.keys(parameter.variants)
        .slice(0, 3)
        .map((v) => `<ParameterType>"${v}"</ParameterType>`)
        .join(`<span class="text-slate-5">|</span>`);
      writer.writeLine(`<span class="space-x-1">`);
      writer.indent();
      writer.writeLine(variantNames);
      if (Object.keys(parameter.variants).length > 3) {
        writer.writeLine(`<span class="text-slate-5">|</span>`);
        writer.writeLine(`<span class="text-slate-5">...</span>`);
      }
      writer.outdent();
      writer.writeLine("</span>");
    })
    .with({ type: "oneOf" }, (parameter) => {
      writer.writeLine("<ParameterType>");
      writer.indent();
      writer.writeLine(`<span class="text-purple-5">oneOf</span>`);
      writer.writeLine(`<span class="text-slate-5">&#123;</span>`);
      const props = Object.keys(parameter.properties).slice(0, 3);
      writer.writeLine(props.join(", "));
      if (Object.keys(parameter.properties).length > 3) {
        writer.writeLine(`<span class="text-slate-5">...</span>`);
      }
      writer.writeLine(`<span class="text-slate-5">&#125;</span>`);
      writer.outdent();
      writer.writeLine("</ParameterType>");
    })
    .with({ type: "union" }, (parameter) => {
      writer.writeLine("<ParameterType>");
      writer.indent();
      const unionTypes = parameter.types
        .slice(0, 3)
        .map((type) => generateInlineType({ imports, parameter: type }))
        .join(`<span class="text-slate-5"> | </span>`);
      writer.writeLine(unionTypes);
      if (parameter.types.length > 3) {
        writer.writeLine(`<span class="text-slate-5"> | ...</span>`);
      }
      writer.outdent();
      writer.writeLine("</ParameterType>");
    })
    .with({ type: "intersection" }, (parameter) => {
      writer.writeLine("<ParameterType>");
      writer.indent();
      const intersectionTypes = parameter.types
        .slice(0, 3)
        .map((type) => generateInlineType({ imports, parameter: type }))
        .join(`<span class="text-slate-5"> & </span>`);
      writer.writeLine(intersectionTypes);
      if (parameter.types.length > 3) {
        writer.writeLine(`<span class="text-slate-5"> & ...</span>`);
      }
      writer.outdent();
      writer.writeLine("</ParameterType>");
    })
    .with({ type: "discriminatedUnion" }, (parameter) => {
      writer.writeLine("<ParameterType>");
      writer.indent();
      const typeNames = [
        parameter.discriminator,
        Object.keys(parameter.types).slice(0, 2),
      ];
      writer.writeLine(`<span class="text-slate-5">&#123;</span>`);
      writer.writeLine(typeNames.join(" | "));
      if (Object.keys(parameter.types).length > 2) {
        writer.writeLine(`<span class="text-slate-5"> | ...</span>`);
      }
      writer.writeLine(`<span class="text-slate-5">&#125;</span>`);
      writer.outdent();
      writer.writeLine("</ParameterType>");
    })
    .with({ type: "resourceRef" }, ({ $ref }) => {
      const componentName = `${pascalCase(getResourceRef($ref).replaceAll("/", "_"))}Type`;
      imports.add(
        `import { Type as ${componentName} } from "~/components/parameter/__generated__/${getResourceRef($ref)}/index.ts";`,
      );
      writer.writeLine(`<${componentName} />`);
    })
    .with({ type: "error" }, () => {
      writer.writeLine("<ParameterType>");
      writer.indent();
      writer.writeLine(`<span class="text-purple-5">error</span>`);
      writer.outdent();
      writer.writeLine("</ParameterType>");
    })
    .exhaustive();
  return writer.content;
}

interface GenerateParameterParams {
  parameterPath: string;
  parameter: Parameter;
}

export function generateParameter({
  parameterPath,
  parameter,
}: GenerateParameterParams) {
  // Create parameter directory if it doesn't exist
  fs.mkdirSync(parameterPath, { recursive: true });

  const baseName = path.basename(parameterPath);

  const imports = new Set<string>();
  const writer = TypescriptWriter();

  imports.add('import Parameter from "~/components/parameter/Parameter";');
  imports.add(
    'import { ParameterType } from "~/components/parameter/ParameterType";',
  );

  // Write TypeDef props interface
  writer.writeLine("interface TypeDefProps {");
  writer.indent();
  writer.writeLine("ident?: string;");
  writer.writeLine("optional?: boolean;");
  writer.outdent();
  writer.writeLine("}");
  writer.writeLine("");

  // Write TypeDef component
  writer.writeLine("export function TypeDef(props: TypeDefProps) {");
  writer.indent();
  writer.writeLine("return (");
  writer.indent();
  if (parameter.type === "resourceRef") {
    const componentName = `${pascalCase(getResourceRef(parameter.$ref).replaceAll("/", "_"))}TypeDef`;
    imports.add(
      `import { TypeDef as ${componentName} } from "~/components/parameter/__generated__/${getResourceRef(parameter.$ref)}/index.ts";`,
    );
    writer.writeLine(`<${componentName} {...props}`);
    writer.indent();
    if (parameter.optional === true) {
      writer.writeLine("optional");
    }
    writer.outdent();
    writer.writeLine("/>");
  } else {
    writer.writeLine("<Parameter.TypeDef");
    writer.indent();
    writer.writeLine("type={<Type {...props} />}");
    writer.writeLine("{...props}");
    if (parameter.type === "enum") {
      writer.writeLine("defaultExpanded={false}");
    }
    writer.outdent();
    writer.writeLine(">");
    writer.indent();
    if (parameter.description !== undefined) {
      const description = generateDescription({
        imports,
        basePath: parameterPath,
        filePath: path.join(parameterPath, baseName),
        description: parameter.description,
      });
      writer.writeLine(`<${description.componentName} />`);
    }
    writer.writeLine("<Details {...props} />");
    writer.outdent();
    writer.writeLine("</Parameter.TypeDef>");
  }
  writer.outdent();
  writer.writeLine(");");
  writer.outdent();
  writer.writeLine("}");
  writer.writeLine("");

  writer.writeLine("export function Type(props: TypeDefProps) {");
  writer.indent();
  writer.writeLine("return (");
  writer.indent();
  match(parameter)
    .with(
      { type: "enum" },
      { type: "error" },
      { type: "discriminatedUnion" },
      { type: "intersection" },
      { type: "object" },
      { type: "oneOf" },
      { type: "union" },
      { type: "array" },
      () => {
        imports.add(
          'import { ParameterHover } from "~/components/parameter/ParameterHover";',
        );
        writer.writeLine("<ParameterHover content={<TypeDef {...props} />}>");
        writer.indent();
        writer.writeLine("<ParameterType>");
        writer.writeLine(`<span class="text-purple-5">${baseName}</span>`);
        writer.writeLine("</ParameterType>");
        writer.outdent();
        writer.writeLine("</ParameterHover>");
      },
    )
    .otherwise((parameter) => {
      writer.writeLine(generateInlineType({ parameter, imports }));
    });
  writer.outdent();
  writer.writeLine(");");
  writer.outdent();
  writer.writeLine("}");

  writer.writeLine("export function Details(props: TypeDefProps) {");
  writer.indent();
  writer.writeLine("return (<>");
  writer.indent();
  writer.writeLine(
    generateTypeDetails({
      imports,
      basePath: parameterPath,
      parameterPath,
      parameter,
    }),
  );
  writer.outdent();
  writer.writeLine("</>);");
  writer.outdent();
  writer.writeLine("}");

  const content =
    "// @vinxi-ignore-style-collection\n" +
    "/* eslint-disable */\n" +
    "\n" +
    Array.from(imports).join("\n") +
    "\n" +
    "\n" +
    writer.content;

  // Write file
  fs.writeFileSync(path.join(parameterPath, `${baseName}.tsx`), content);
  fs.writeFileSync(
    path.join(parameterPath, `index.ts`),
    `export * from "./${baseName}.tsx";`,
  );
}
