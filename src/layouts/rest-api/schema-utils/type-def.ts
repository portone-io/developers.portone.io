import { P, match } from "ts-pattern";
import type {
  TypeDef,
  Property,
  Properties,
  OpenApiSchema,
  Parameter,
} from ".";
import type { CategoryEndpointsPair } from "./endpoint";
import { type Visitor, defaultVisitor } from "./visitor";

export type TypeDefKind = "object" | "union" | "enum";
export type TypeDefWithKind =
  | { kind: "object"; typeDef?: TypeDef | undefined }
  | {
      kind: "union";
      typeDef: TypeDef & {
        discriminator: NonNullable<TypeDef["discriminator"]>;
      };
    }
  | { kind: "enum"; typeDef: TypeDef & { enum: NonNullable<TypeDef["enum"]> } };
export function getTypeDefWithKind(
  typeDef?: TypeDef | undefined,
): TypeDefWithKind {
  return match(typeDef)
    .returnType<TypeDefWithKind>()
    .with({ discriminator: P.not(P.nullish) }, (typeDef) => ({
      kind: "union",
      typeDef,
    }))
    .with({ enum: P.not(P.nullish) }, (typeDef) => ({ kind: "enum", typeDef }))
    .otherwise(() => ({ kind: "object", typeDef }));
}

export interface BakedProperty extends Property {
  name: string;
  required?: boolean | undefined;
}

export function bakeProperties(
  schema: OpenApiSchema,
  typeDef: TypeDef,
): BakedProperty[] {
  if (!typeDef.$ref && typeDef.type) {
    switch (typeDef.type) {
      case "object":
      case "array":
        break;
      default:
        return [];
    }
  }
  const resolvedDef = resolveTypeDef(schema, typeDef, true);
  const properties = Object.entries(resolvedDef.properties || {});
  return properties.map(([name, property]) => {
    const $ref = property.$ref;
    const resolvedProperty = resolveTypeDef(schema, property);
    const type = $ref ? getTypenameByRef($ref) : resolvedProperty.type;
    const required = resolvedDef.required?.includes(name);
    return { ...resolvedProperty, $ref, type, name, required } as BakedProperty;
  });
}

export function resolveTypeDef(
  schema: OpenApiSchema,
  typeDef: TypeDef | Property,
  unwrapArray = false,
): TypeDef {
  return mergeAllOf(schema, followRef(schema, typeDef, unwrapArray));
}

export function mergeAllOf(schema: OpenApiSchema, typeDef: TypeDef): TypeDef {
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

export function followRef(
  schema: OpenApiSchema,
  typeDef: TypeDef | Property,
  unwrapArray = false,
): TypeDef {
  let curr = typeDef;
  while (curr.$ref) curr = getTypeDefByRef(schema, curr.$ref);
  if (unwrapArray && curr.type === "array" && curr.items) {
    return followRef(schema, curr.items as TypeDef);
  }
  return curr as TypeDef;
}

export function getTypeDefByRef(schema: OpenApiSchema, $ref: string): TypeDef {
  const path = $ref.split("/"); // "#/foo/bar" => ["#", "foo", "bar"]
  path.shift();
  let ref: Record<string, unknown> = schema;
  for (const fragment of path) {
    ref = ref[fragment as keyof typeof ref] as Record<string, unknown>;
  }
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

export function crawlRefs(
  schema: OpenApiSchema,
  endpointGroups: CategoryEndpointsPair[],
): string[] {
  const result = new Set<string>();
  const rootPropertyRefsCrawler: Visitor = {
    ...defaultVisitor,
    visitUnion(typeDef) {
      for (const item of typeDef.oneOf) item.$ref && result.add(item.$ref);
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
  };
  for (const group of endpointGroups) {
    for (const { path, method } of group.endpoints) {
      const endpoint = schema.paths[path];
      const operation = endpoint?.[method];
      if (!operation) continue;
      rootRefsCrawler.visitOperation(method, operation);
    }
  }
  const typeDefRefsCrawler: Visitor = {
    ...defaultVisitor,
    visitUnion(typeDef) {
      const refs = (typeDef.oneOf
        ?.map((def) => def.$ref || def.items?.$ref)
        .filter(Boolean) ?? []) as string[];
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
  let currentRef: string | undefined;
  while ((currentRef = queue.shift())) {
    const typeDef = resolveTypeDef(schema, getTypeDefByRef(schema, currentRef));
    typeDefRefsCrawler.visitTypeDef(typeDef);
  }
  return Array.from(result);
}
