import fs from "node:fs";
import path from "node:path";

import { camelCase, pascalCase } from "es-toolkit/string";
import { match, P } from "ts-pattern";

import { TypescriptWriter } from "./common.ts";
import { getNonEmptyFlags } from "./flags.ts";
import { getResourceRef, type Parameter } from "./schema.ts";
import { getComponentName } from "./utils.ts";

function shouldUseDefaultExpanded(
  parameter: Parameter,
  resourceMap: Record<string, Parameter>,
): boolean {
  if (parameter.type === "array") {
    return shouldUseDefaultExpanded(parameter.items, resourceMap);
  }

  if (parameter.type === "resourceRef") {
    const ref = getResourceRef(parameter.$ref);
    const resource = resourceMap[ref];
    return resource ? shouldUseDefaultExpanded(resource, resourceMap) : false;
  }

  if (parameter.type === "enum" && parameter.variants) {
    return Object.keys(parameter.variants).length >= 10;
  }

  return false;
}

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
  fs.writeFileSync(
    file,
    `import { PgSection } from "~/components/PgSection";\n\n${description}`,
  );
  const componentName = pascalCase(
    `${path.posix
      .relative(basePath, filePath)
      .split("/")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join("")}Description`,
  );

  imports.add(
    `import ${componentName} from "./${path.posix.relative(basePath, file)}";`,
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
  leadingDescription,
  resourceMap,
}: {
  imports: Set<string>;
  basePath: string;
  parameterPath: string;
  ident?: string;
  parameter: Parameter;
  defaultExpanded?: boolean;
  leadingDescription?: string;
  resourceMap: Record<string, Parameter>;
}): string {
  const writer = TypescriptWriter();

  const hasFlagCondition =
    parameter.flagOptions && Object.keys(parameter.flagOptions).length > 0;
  const visibleFlags =
    hasFlagCondition && parameter.flagOptions
      ? Object.entries(parameter.flagOptions)
          .filter(([_, spec]) => spec.visible === true)
          .map(([flag]) => flag)
      : [];

  if (hasFlagCondition && visibleFlags.length > 0) {
    imports.add('import { Condition } from "~/components/Condition";');
    writer.writeLine(
      `<Condition flag={(flag) => [${visibleFlags.map((flag) => `"${flag}"`).join(", ")}].includes(flag)}>`,
    );
    writer.indent();
  }

  if (parameter.type === "resourceRef" && parameter.description === undefined) {
    const modulePath = `~/components/parameter/__generated__/${getResourceRef(parameter.$ref)}/index.ts`;
    const componentName = `${getComponentName(parameter.$ref)}TypeDef`;
    imports.add(`import { TypeDef as ${componentName} } from "${modulePath}";`);

    writer.writeLine(`<${componentName}`);
    writer.indent();
    if (parameter.optional === true) {
      writer.writeLine("optional");
    }
    if (ident !== undefined) {
      writer.writeLine(`ident="${ident}"`);
    }
    if (leadingDescription !== undefined) {
      const description = generateDescription({
        imports,
        basePath,
        filePath: path.posix.join(parameterPath, "Leading"),
        description: leadingDescription,
      });
      writer.writeLine(`leadingDescription={<${description.componentName} />}`);
    }
    if (defaultExpanded === false) {
      writer.writeLine("defaultExpanded={false}");
    }
    writer.outdent();
    writer.writeLine("/>");

    if (hasFlagCondition && visibleFlags.length > 0) {
      writer.outdent();
      writer.writeLine("</Condition>");
    }

    return writer.content;
  }
  writer.writeLine("<Parameter.TypeDef");
  writer.indent();
  writer.writeLine(
    `type={<Parameter.Type>${generateInlineType({ parameter, imports })}</Parameter.Type>}`,
  );
  if (parameter.optional === true) {
    writer.writeLine("optional");
  }
  if (ident !== undefined) {
    writer.writeLine(`ident="${ident}"`);
  }
  if (
    defaultExpanded === false ||
    shouldUseDefaultExpanded(parameter, resourceMap)
  ) {
    writer.writeLine(`defaultExpanded={false}`);
  }
  writer.outdent();
  writer.writeLine(">");
  writer.indent();
  match(parameter)
    .with({ description: P.string }, (parameter) => {
      const description = generateDescription({
        imports,
        basePath,
        filePath: parameterPath,
        description: parameter.description,
      });
      writer.writeLine(`<${description.componentName} />`);
    })
    .with(
      {
        description: P.nullish,
        type: "array",
        items: { description: P.string },
      },
      (parameter) => {
        const description = generateDescription({
          imports,
          basePath,
          filePath: parameterPath,
          description: parameter.items.description,
        });
        writer.writeLine(`<${description.componentName} />`);
      },
    )
    .with(
      {
        type: "array",
        items: { type: "resourceRef" },
      },
      (parameter) => {
        const componentName = `${getComponentName(parameter.items.$ref)}Description`;
        imports.add(
          `import { Description as ${componentName} } from "~/components/parameter/__generated__/${getResourceRef(parameter.items.$ref)}/index.ts";`,
        );
        writer.writeLine(`<${componentName} />`);
      },
    )
    .otherwise(() => {});
  writer.writeLine(
    generateTypeDetails({
      parameter,
      imports,
      basePath,
      parameterPath,
      resourceMap,
    }),
  );
  writer.outdent();
  writer.writeLine("</Parameter.TypeDef>");

  if (hasFlagCondition && visibleFlags.length > 0) {
    writer.outdent();
    writer.writeLine("</Condition>");
  }

  return writer.content;
}

function generateTypeDetails({
  imports,
  basePath,
  parameterPath,
  parameter,
  resourceMap,
}: {
  imports: Set<string>;
  basePath: string;
  parameterPath: string;
  parameter: Parameter;
  resourceMap: Record<string, Parameter>;
}): string {
  const writer = TypescriptWriter();

  match(parameter)
    .with({ type: "array" }, (parameter) => {
      writer.writeLine(
        generateTypeDetails({
          imports,
          basePath,
          parameterPath: path.posix.join(parameterPath, "items"),
          parameter: parameter.items,
          resourceMap,
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
            parameterPath: path.posix.join(parameterPath, propName),
            resourceMap,
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
            parameter: propValue,
            leadingDescription: `\`${parameter.discriminator}\`가 \`${discriminateValue}\`인 경우에만 허용됩니다.\n\n`,
            parameterPath: path.posix.join(parameterPath, ident),
            defaultExpanded: false,
            resourceMap,
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
          writer.writeLine(
            `<Parameter.TypeDef type={<Parameter.Type>"${variantName}"</Parameter.Type>}>`,
          );
          writer.indent();
          const description = generateDescription({
            imports,
            basePath,
            filePath: path.posix.join(parameterPath, `Variant${variantName}`),
            description: variant.description,
          });
          writer.writeLine(`<${description.componentName} />`);
          writer.outdent();
          writer.writeLine("</Parameter.TypeDef>");
        } else {
          writer.writeLine(
            `<Parameter.TypeDef type={<Parameter.Type>"${variantName}"</Parameter.Type>} />`,
          );
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
            parameterPath: path.posix.join(
              parameterPath,
              `${parameter.type}${index}`,
            ),
            resourceMap,
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
            parameterPath: path.posix.join(
              parameterPath,
              `${parameter.type}${index}`,
            ),
            resourceMap,
          }),
        );
      });
    })
    .with({ type: "resourceRef" }, (parameter) => {
      const componentName = `${getComponentName(parameter.$ref)}Details`;
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
      { type: "json" },
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
      { type: "json" },
      (param) => {
        const typeMap = {
          string: "string",
          integer: "number",
          boolean: "boolean",
          emptyObject: "{}",
          json: "json",
        };
        writer.writeLine(`{"${typeMap[param.type]}"}`);
      },
    )
    .with({ type: "stringLiteral" }, ({ value }) => {
      writer.writeLine(`"${value}"`);
    })
    .with({ type: "array" }, (parameter) => {
      writer.writeLine(`<span class="text-purple-5">Array</span>`);
      writer.writeLine(`<span class="text-slate-5">&lt;</span>`);
      writer.writeLine(
        generateInlineType({
          imports,
          parameter: parameter.items,
        }),
      );
      writer.writeLine(`<span class="text-slate-5">&gt;</span>`);
    })
    .with({ type: "object" }, (parameter) => {
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
    })
    .with({ type: "enum" }, (parameter) => {
      const variantNames = Object.keys(parameter.variants)
        .slice(0, 3)
        .map((v) => `<Parameter.Type>"${v}"</Parameter.Type>`)
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
      writer.writeLine(`<span class="text-purple-5">oneOf</span>`);
      writer.writeLine(`<span class="text-slate-5">&#123;</span>`);
      const props = Object.keys(parameter.properties).slice(0, 3);
      writer.writeLine(props.join(", "));
      if (Object.keys(parameter.properties).length > 3) {
        writer.writeLine(`<span class="text-slate-5">...</span>`);
      }
      writer.writeLine(`<span class="text-slate-5">&#125;</span>`);
    })
    .with({ type: "union" }, (parameter) => {
      const unionTypes = parameter.types
        .slice(0, 3)
        .map((type) => generateInlineType({ imports, parameter: type }))
        .join(`<span class="text-slate-5"> | </span>`);
      writer.writeLine(unionTypes);
      if (parameter.types.length > 3) {
        writer.writeLine(`<span class="text-slate-5"> | ...</span>`);
      }
    })
    .with({ type: "intersection" }, (parameter) => {
      const intersectionTypes = parameter.types
        .slice(0, 3)
        .map((type) => generateInlineType({ imports, parameter: type }))
        .join(`<span class="text-slate-5"> & </span>`);
      writer.writeLine(intersectionTypes);
      if (parameter.types.length > 3) {
        writer.writeLine(`<span class="text-slate-5"> & ...</span>`);
      }
    })
    .with({ type: "discriminatedUnion" }, (parameter) => {
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
    })
    .with({ type: "resourceRef" }, ({ $ref }) => {
      const componentName = `${getComponentName($ref)}Type`;
      imports.add(
        `import { Type as ${componentName} } from "~/components/parameter/__generated__/${getResourceRef($ref)}/index.ts";`,
      );
      writer.writeLine(`<${componentName} />`);
    })
    .with({ type: "error" }, () => {
      writer.writeLine(`<span class="text-purple-5">error</span>`);
    })
    .exhaustive();
  return writer.content;
}

interface GenerateParameterParams {
  parameterPath: string;
  parameter: Parameter;
  resourceMap: Record<string, Parameter>;
}

export function generateParameter({
  parameterPath,
  parameter,
  resourceMap,
}: GenerateParameterParams) {
  fs.mkdirSync(parameterPath, { recursive: true });

  const baseName = path.basename(parameterPath);
  const parameterName = parameter.name ?? baseName;

  const imports = new Set<string>();
  const writer = TypescriptWriter();

  imports.add('import { type JSXElement } from "solid-js";');
  imports.add('import Parameter from "~/components/parameter/Parameter.tsx";');

  writer.writeLine("interface TypeDefProps {");
  writer.indent();
  writer.writeLine("ident?: string;");
  writer.writeLine("optional?: boolean;");
  writer.writeLine("leadingDescription?: JSXElement;");
  writer.writeLine("defaultExpanded?: boolean;");
  writer.outdent();
  writer.writeLine("}");
  writer.writeLine("");

  writer.writeLine("export function TypeDef(props: TypeDefProps) {");
  writer.indent();
  writer.writeLine("return (");
  writer.indent();

  const nonEmptyPgs = getNonEmptyFlags(parameter);
  const shouldApplyHideIfEmpty = nonEmptyPgs !== null;

  if (shouldApplyHideIfEmpty && nonEmptyPgs && nonEmptyPgs.length > 0) {
    imports.add('import { Condition } from "~/components/Condition";');
    writer.writeLine(
      `<Condition flag={(flag) => [${nonEmptyPgs.map((flag) => `"${flag}"`).join(", ")}].includes(flag)}>`,
    );
    writer.indent();
  }

  if (parameter.type === "resourceRef" && parameter.description === undefined) {
    const componentName = `${getComponentName(parameter.$ref)}TypeDef`;
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
    if (shouldUseDefaultExpanded(parameter, resourceMap)) {
      writer.writeLine("defaultExpanded={false}");
    }
    writer.outdent();
    writer.writeLine(">");
    writer.indent();
    writer.writeLine("<Description />");
    writer.writeLine("<Details {...props} />");
    writer.outdent();
    writer.writeLine("</Parameter.TypeDef>");
  }

  if (shouldApplyHideIfEmpty && nonEmptyPgs && nonEmptyPgs.length > 0) {
    writer.outdent();
    writer.writeLine("</Condition>");
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
        writer.writeLine(
          "<Parameter.Hover content={() => <TypeDef {...props} />}>",
        );
        writer.indent();
        writer.writeLine("<Parameter.Type>");
        writer.writeLine(`<span class="text-purple-5">${parameterName}</span>`);
        writer.writeLine("</Parameter.Type>");
        writer.outdent();
        writer.writeLine("</Parameter.Hover>");
      },
    )
    .otherwise((parameter) => {
      writer.writeLine("<Parameter.Type>");
      writer.indent();
      writer.writeLine(generateInlineType({ parameter, imports }));
      writer.outdent();
      writer.writeLine("</Parameter.Type>");
    });
  writer.outdent();
  writer.writeLine(");");
  writer.outdent();
  writer.writeLine("}");

  writer.writeLine("export function Description() {");
  writer.indent();
  if (parameter.description !== undefined) {
    const description = generateDescription({
      imports,
      basePath: parameterPath,
      filePath: path.posix.join(parameterPath, parameterName),
      description: parameter.description,
    });
    writer.writeLine(`return <${description.componentName} />;`);
  } else {
    writer.writeLine("return null;");
  }
  writer.outdent();
  writer.writeLine("}");
  writer.writeLine("");

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
      resourceMap,
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
  fs.writeFileSync(path.join(parameterPath, `${parameterName}.tsx`), content);
  fs.writeFileSync(
    path.join(parameterPath, `index.ts`),
    `export * from "./${parameterName}.tsx";`,
  );
}
