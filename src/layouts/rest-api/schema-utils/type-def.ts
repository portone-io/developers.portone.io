import type { Parameter } from "./operation";
import { type Visitor, defaultVisitor } from "./visitor";

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
  /**
   * @deprecated use `x-portone-title`
   */
  "x-portone-name"?: string | undefined;
  "x-portone-title"?: string | undefined;
  "x-portone-summary"?: string | undefined;
  "x-portone-description"?: string | undefined;
  "x-portone-enum"?: { [enumValue: string]: TypeDef };
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
  items?: string | TypeDef | undefined;
  deprecated?: boolean | undefined;
  /**
   * @deprecated use `x-portone-title`
   */
  "x-portone-name"?: string | undefined;
  "x-portone-title"?: string | undefined;
  "x-portone-summary"?: string | undefined;
  "x-portone-description"?: string | undefined;
}

export type TypeDefKind = "object" | "union" | "enum";
export function getTypeDefKind(typeDef?: TypeDef | undefined): TypeDefKind {
  if (typeDef?.discriminator) return "union";
  if (typeDef?.enum) return "enum";
  return "object";
}

export interface BakedProperty extends Property {
  name: string;
  required?: boolean | undefined;
}

export function bakeProperties(schema: any, typeDef: TypeDef): BakedProperty[] {
  const resolvedDef = resolveTypeDef(schema, typeDef);
  const properties = Object.entries(resolvedDef.properties || {});
  return properties.map(([name, property]) => {
    const $ref = property.$ref;
    const resolvedProperty = resolveTypeDef(schema, property);
    const type = $ref ? getTypenameByRef($ref) : resolvedProperty.type;
    const required = typeDef.required?.includes(name);
    return { ...resolvedProperty, $ref, type, name, required } as BakedProperty;
  });
}

export function resolveTypeDef(
  schema: any,
  typeDef: TypeDef | Property
): TypeDef {
  return mergeAllOf(schema, followRef(schema, typeDef));
}

export function mergeAllOf(schema: any, typeDef: TypeDef): TypeDef {
  if (!typeDef.allOf) return typeDef;
  const required: string[] = [];
  const properties: Properties = {};
  for (const _item of typeDef.allOf) {
    const item = followRef(schema, _item);
    item.required && required.push(...item.required);
    item.properties && Object.assign(properties, item.properties);
  }
  const result: TypeDef = { required, properties };
  Object.assign(result, typeDef);
  delete result.allOf;
  return result;
}

export function followRef(schema: any, typeDef: TypeDef | Property): TypeDef {
  let curr = typeDef;
  while (curr.$ref) curr = getTypeDefByRef(schema, curr.$ref);
  return curr as TypeDef;
}

export function getTypeDefByRef(schema: any, $ref: string): TypeDef {
  const path = $ref.split("/"); // "#/foo/bar" => ["#", "foo", "bar"]
  path.shift();
  let ref = schema;
  for (const fragment of path) ref = ref[fragment];
  return ref;
}

export function getTypenameByRef($ref: string): string {
  return $ref.split("/").pop()!;
}

export function repr(def: string | TypeDef | Property | Parameter): string {
  if (typeof def === "string") return getTypenameByRef(def);
  if ("schema" in def) return repr(def.schema!);
  if (def.items) return `${repr(def.items)}[]`;
  if (def.$ref) return getTypenameByRef(def.$ref);
  return def.type || "";
}

export function crawlRefs(schema: any): string[] {
  const result = new Set<string>();
  const rootPropertyRefsCrawler: Visitor = {
    ...defaultVisitor,
    visitUnion(typeDef) {
      for (const item of typeDef.oneOf!) item.$ref && result.add(item.$ref);
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
      rootPropertyRefsCrawler.visitTypeDef(typeDef);
    },
  };
  rootRefsCrawler.visitSchemaPaths(schema.paths);
  const typeDefRefsCrawler: Visitor = {
    ...defaultVisitor,
    visitUnion(typeDef) {
      const refs = typeDef
        .oneOf!.map((def) => def.$ref || def.items?.$ref)
        .filter(Boolean) as string[];
      for (const ref of refs) push(ref);
      defaultVisitor.visitUnion.call(this, typeDef);
    },
    visitProperty(_name, property) {
      push(property.$ref);
      if (typeof property.items !== "string") push(property.items?.$ref);
    },
  };
  const queue = Array.from(result);
  function push(ref?: string | undefined) {
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
