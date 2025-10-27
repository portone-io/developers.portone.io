import fs from "node:fs";
import path from "node:path";

import { TypescriptWriter } from "./common.ts";
import { generateParameter } from "./parameter.ts";
import {
  makeResourceMap,
  type Parameter,
  parseSchema,
  type Schema,
} from "./schema.ts";

export function generate(root: string, schema: Schema) {
  const srcPath = path.resolve(root, "__generated__");
  if (fs.existsSync(srcPath)) {
    fs.rmSync(srcPath, { recursive: true });
  }
  fs.mkdirSync(srcPath, { recursive: true });
  const resourceMap = makeResourceMap(schema.resources);
  generateParameterDirectory(srcPath, resourceMap);
  generateIndex(srcPath, resourceMap);
}

function generateFlagsFile(schema: Schema, outputPath: string) {
  const writer = TypescriptWriter();

  writer.writeLine("// @vinxi-ignore-style-collection");
  writer.writeLine("/* eslint-disable */");
  writer.writeLine("");
  writer.writeLine('import { z } from "zod";');
  writer.writeLine("");

  const flagKeys = Object.keys(schema.flags || {});

  writer.writeLine("export const Flags = z.enum([");
  writer.indent();
  flagKeys.forEach((flag, index) => {
    const isLast = index === flagKeys.length - 1;
    writer.writeLine(`"${flag}"${isLast ? "" : ","}`);
  });
  writer.outdent();
  writer.writeLine("]);");
  writer.writeLine("export type Flags = z.infer<typeof Flags>;");

  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(outputPath, writer.content);
}

function generateParameterDirectory(
  srcPath: string,
  resourceMap: Record<string, Parameter>,
) {
  for (const [key, value] of Object.entries(resourceMap)) {
    const parameterPath = path.join(srcPath, key);
    fs.mkdirSync(parameterPath, { recursive: true });
    generateParameter({
      parameter: value,
      parameterPath,
      resourceMap,
    });
  }
}

function generateIndex(
  srcPath: string,
  resourceMap: Record<string, Parameter>,
) {
  const writer = TypescriptWriter();
  writer.writeLine('import { lazy } from "solid-js";');
  writer.writeLine("");

  writer.writeLine("export const browserSdk = {");
  writer.indent();

  for (const [key, _] of Object.entries(resourceMap)) {
    const resourcePath = key;
    const relativePath = `./${path.posix.join(resourcePath, "index.ts")}`;

    writer.writeLine(`"#/resources/${resourcePath}": {`);
    writer.indent();
    writer.writeLine("typeDef: lazy(() =>");
    writer.indent();
    writer.writeLine(
      `import("${relativePath}").then(({ TypeDef }) => ({ default: TypeDef })),`,
    );
    writer.outdent();
    writer.writeLine("),");
    writer.writeLine("type: lazy(() =>");
    writer.indent();
    writer.writeLine(
      `import("${relativePath}").then(({ Type }) => ({ default: Type })),`,
    );
    writer.outdent();
    writer.writeLine("),");
    writer.writeLine("details: lazy(() =>");
    writer.indent();
    writer.writeLine(
      `import("${relativePath}").then(({ Details }) => ({ default: Details })),`,
    );
    writer.outdent();
    writer.writeLine("),");
    writer.writeLine("description: lazy(() =>");
    writer.indent();
    writer.writeLine(
      `import("${relativePath}").then(({ Description }) => ({ default: Description })),`,
    );
    writer.outdent();
    writer.writeLine("),");
    writer.outdent();
    writer.writeLine("},");
  }

  writer.outdent();
  writer.writeLine("};");

  // Write index.ts file
  fs.writeFileSync(path.posix.join(srcPath, "index.ts"), writer.content);
}

const yamlText: string = fs.readFileSync(
  path.resolve(import.meta.dirname, "../../../src/schema/browser-sdk.yml"),
  { encoding: "utf-8" },
);

const schema = parseSchema(yamlText);

generate(
  path.resolve(import.meta.dirname, "../../../src/components/parameter"),
  schema,
);

generateFlagsFile(
  schema,
  path.resolve(
    import.meta.dirname,
    "../../../src/types/__generated__/flags.ts",
  ),
);
