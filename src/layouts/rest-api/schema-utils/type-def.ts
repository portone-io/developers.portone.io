import type { CategoryEndpointsPair } from "./endpoint";
import type { Operation, Parameter } from "./operation";
import { defaultVisitor, type Visitor } from "./visitor";

export interface TypeDef {
  $ref?: string | undefined;
  allOf?: TypeDef[] | undefined;
  oneOf?: TypeDef[] | undefined;
  discriminator?: { propertyName: string; mapping: Record<string, string> };
  title?: string | undefined;
  summary?: string | undefined;
  description?: string | undefined;
  type?: string | undefined;
  enum?: string[];
  items?: TypeDef | undefined;
  required?: string[] | undefined;
  properties?: Properties | undefined;
  additionalProperties?: Property | undefined;
  /**
   * @deprecated use `x-portone-title`
   */
  "x-portone-name"?: string | undefined;
  "x-portone-title"?: string | undefined;
  "x-portone-summary"?: string | undefined;
  "x-portone-description"?: string | undefined;
  "x-portone-enum"?: { [enumValue: string]: TypeDef };
  "x-portone-discriminator"?: Record<string, TypeDef>;
  "x-portone-status-code"?: number;
}

export interface Properties {
  [name: string]: Property;
}

export interface Property {
  $ref?: string | undefined;
  title?: string | undefined;
  summary?: string | undefined;
  description?: string | undefined;
  type?: string | undefined;
  format?: string | undefined;
  items?: TypeDef | undefined;
  deprecated?: boolean | undefined;
  example?: unknown;
  /**
   * @deprecated use `x-portone-title`
   */
  "x-portone-name"?: string | undefined;
  "x-portone-title"?: string | undefined;
  "x-portone-summary"?: string | undefined;
  "x-portone-description"?: string | undefined;
  "x-portone-query-or-body"?:
    | {
        enabled: boolean;
        required: boolean;
      }
    | undefined;
}

export interface ResponseProperty {
  $ref?: string;
  properties?: Record<string, ResponseProperty>;
}

export type TypeDefKind = "object" | "union" | "enum" | "primitive";
export function getTypeDefKind(typeDef?: TypeDef): TypeDefKind {
  if (typeDef?.discriminator) return "union";
  if (typeDef?.enum) return "enum";
  if (typeDef?.properties) return "object";
  return "primitive";
}

export interface BakedProperty extends Property {
  name: string;
  required?: boolean | undefined;
}

export function bakeProperties(
  schema: unknown,
  typeDef: TypeDef,
  example?: { [key: string]: unknown },
): BakedProperty[] {
  filter: if (!typeDef.$ref && typeDef.type) {
    switch (typeDef.type) {
      case "object":
      case "array":
        break filter;
      default:
        return [];
    }
  }
  const resolvedDef = resolveTypeDef(schema, typeDef, true);
  const properties = Object.entries(resolvedDef.properties || {});
  if (resolvedDef.additionalProperties) {
    properties.push(["[key: string]", resolvedDef.additionalProperties]);
  }
  return properties.map(([name, property]) => {
    const $ref = property.$ref;
    const resolvedProperty = resolveTypeDef(schema, property);
    const type = $ref ? getTypenameByRef($ref) : resolvedProperty.type;
    const required = resolvedDef.required?.includes(name);
    return {
      ...resolvedProperty,
      $ref,
      type,
      name,
      required,
      example: example?.[name],
    } as BakedProperty;
  });
}

export function resolveTypeDef(
  schema: unknown,
  typeDef: TypeDef | Property,
  unwrapArray = false,
): TypeDef {
  return mergeAllOf(schema, followRef(schema, typeDef, unwrapArray));
}

export function mergeAllOf(schema: unknown, typeDef: TypeDef): TypeDef {
  if (!typeDef.allOf) return typeDef;
  const required: string[] = [];
  const properties: Properties = {};
  for (const _item of typeDef.allOf) {
    const item = followRef(schema, _item);
    if (item.required) required.push(...item.required);
    if (item.properties) Object.assign(properties, item.properties);
  }
  const result: TypeDef = { required, properties };
  Object.assign(result, typeDef);
  delete result.allOf;
  return result;
}

export function followRef(
  schema: unknown,
  typeDef: TypeDef | Property,
  unwrapArray = false,
): TypeDef {
  let curr = typeDef;
  while (curr.$ref) curr = getTypeDefByRef(schema, curr.$ref);
  if (unwrapArray && curr.type === "array" && curr.items) {
    return followRef(schema, curr.items);
  }
  return curr as TypeDef;
}

export function getTypeDefByRef(schema: unknown, $ref: string): TypeDef {
  const path = $ref.split("/"); // "#/foo/bar" => ["#", "foo", "bar"]
  path.shift();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let ref: any = schema;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  for (const fragment of path) ref = ref[fragment];
  return ref as TypeDef;
}

export function getTypenameByRef($ref: string): string {
  return $ref.split("/").pop()!;
}

export function repr(def: string | TypeDef | Property | Parameter): string {
  if (typeof def === "string") return getTypenameByRef(def);
  if ("schema" in def) return repr(def.schema!);
  if (def.items) return "_array";
  if (def.$ref) return getTypenameByRef(def.$ref);
  if ("discriminator" in def && def.discriminator) return "_union";
  if ("enum" in def && def.enum) return "_enum";
  if ("properties" in def && def.properties) return "object";
  if (!def.type && "allOf" in def && def.allOf) return "object";
  return def.type || "";
}

export function crawlRefs(
  schema: unknown,
  endpointGroups: CategoryEndpointsPair[],
): string[] {
  const s = schema as {
    paths: { [path: string]: { [method: string]: Operation } };
  };
  const result = new Set<string>();
  const rootPropertyRefsCrawler: Visitor = {
    ...defaultVisitor,
    visitUnion(typeDef) {
      for (const item of typeDef.oneOf!) {
        if (item.$ref) result.add(item.$ref);
      }
      defaultVisitor.visitUnion.call(this, typeDef);
    },
    visitProperty(_name, property) {
      if (property.$ref) result.add(property.$ref);
      if (typeof property.items !== "string" && property.items?.$ref) {
        result.add(property.items.$ref);
      }
    },
  };
  const rootRefsCrawler: Visitor = {
    ...defaultVisitor,
    visitParameter(parameter) {
      if (parameter.$ref) {
        result.add(parameter.$ref);
      } else if (typeof parameter.items !== "string" && parameter.items?.$ref) {
        result.add(parameter.items.$ref);
      } else if (parameter.schema?.$ref) {
        result.add(parameter.schema.$ref);
      } else if (parameter.schema?.items?.$ref) {
        result.add(parameter.schema.items.$ref);
      }
    },
    visitRequestRef(ref) {
      const typeDef = resolveTypeDef(schema, getTypeDefByRef(schema, ref));
      rootPropertyRefsCrawler.visitTypeDef(typeDef);
    },
    visitResponseRef(ref) {
      const typeDef = resolveTypeDef(schema, getTypeDefByRef(schema, ref));
      result.add(ref);
      rootPropertyRefsCrawler.visitTypeDef(typeDef);
    },
    visitResponseProperties(properties: Record<string, ResponseProperty>) {
      for (const [_, value] of Object.entries(properties)) {
        if (value.$ref) {
          this.visitResponseRef(value.$ref || "");
        } else if (value.properties) {
          this.visitResponseProperties(value.properties);
        }
      }
    },
  };
  for (const group of endpointGroups) {
    for (const { path, method } of group.endpoints) {
      const endpoint = s.paths[path]!;
      const operation = endpoint[method]!;
      rootRefsCrawler.visitOperation(method, operation);
    }
  }
  const typeDefRefsCrawler: Visitor = {
    ...defaultVisitor,
    visitUnion(typeDef) {
      const refs = typeDef
        .oneOf!.map((def) => def.$ref || def.items?.$ref)
        .filter(Boolean);
      for (const ref of refs) push(ref);
      defaultVisitor.visitUnion.call(this, typeDef);
    },
    visitProperty(_name, property) {
      push(property.$ref);
      if (typeof property.items !== "string") push(property.items?.$ref);
    },
  };
  const queue = Array.from(result);
  function push(ref?: string) {
    if (!ref) return;
    if (result.has(ref)) return;
    result.add(ref);
    queue.push(ref);
  }
  let currentRef: string;
  while ((currentRef = queue.shift()!)) {
    const typeDef = resolveTypeDef(schema, getTypeDefByRef(schema, currentRef));
    typeDefRefsCrawler.visitTypeDef(typeDef);
  }
  return Array.from(result);
}
