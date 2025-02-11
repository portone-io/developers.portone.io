import YAML from "yaml";

export interface Schema {
  pgProviders: Record<string, PgProvider>;
  resources: Resource;
  methods: Record<string, Method>;
}

export interface PgProvider {
  description: string;
}

type Resource = Parameter | { [key: string]: Resource };

export type Parameter = {
  name?: string;
  description?: string;
  optional?: boolean;
  pgSpecific?: Record<string, PgSpecific>;
  deprecated?: boolean;
} & ParameterType;

export type ParameterType =
  | { type: "string" }
  | { type: "stringLiteral"; value: string }
  | { type: "integer" }
  | { type: "boolean" }
  | { type: "array"; items: Parameter }
  | { type: "object"; properties: Record<string, Parameter> }
  | { type: "emptyObject" }
  | {
      type: "enum";
      variants: Record<string, EnumVariant>;
      valuePrefix?: string;
    }
  | { type: "oneOf"; properties: Record<string, Parameter> }
  | { type: "union"; types: Parameter[] }
  | { type: "intersection"; types: Parameter[] }
  | {
      type: "discriminatedUnion";
      types: Record<string, Parameter>;
      discriminator: string;
    }
  | { type: "resourceRef"; $ref: string }
  | {
      type: "error";
      transactionType?: string;
      properties: Record<string, Parameter>;
    }
  | { type: "json" };

export interface EnumVariant {
  description?: string;
}

export interface PgSpecific {
  description?: string;
  optional?: boolean;
}

export interface Method {
  description?: string;
  input: Parameter;
  callbacks?: Record<string, Callback>;
  output?: Parameter;
}

export interface Callback {
  description?: string;
  input: Record<string, Parameter>;
}

export function getResourceRef(resourceRef: string): string {
  return resourceRef.replace(/^#\/resources\//, "");
}

export function parseSchema(yamlText: string): Schema {
  const data: unknown = YAML.parse(yamlText);
  return data as Schema;
}

export function makeResourceMap(
  resources: Resource,
): Record<string, Parameter> {
  const index: Record<string, Parameter> = {};

  function collectResources(path: string, resource: Resource): void {
    if (isParameter(resource)) {
      index[path] = resource;
    } else {
      for (const key in resource) {
        const newPath = path ? `${path}/${key}` : key;
        collectResources(newPath, resource[key]!);
      }
    }
  }

  collectResources("", resources);
  return index;
}

function isParameter(obj: unknown): obj is Parameter {
  if (obj && typeof obj === "object") {
    if ("name" in obj && "parameter" in obj) {
      return true;
    }
    if ("type" in obj) {
      return true;
    }
  }
  return false;
}
