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
  items?: TypeDef | string | undefined;
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
  items?: TypeDef | string | undefined;
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
  if (typeDef?.additionalProperties) return "object";
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
    const required = resolvedDef.required?.includes?.(name);
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

export function extractCommonPropertiesFromUnion(
  schema: unknown,
  unionTypeDef: TypeDef,
): BakedProperty[] {
  if (!unionTypeDef.discriminator?.mapping) {
    return [];
  }

  const discriminator = unionTypeDef.discriminator;
  const variantRefs = Object.values(discriminator.mapping);

  if (variantRefs.length === 0) {
    return [];
  }

  // 각 variant의 properties를 가져옴
  const allVariantProperties = variantRefs.map((ref) => {
    const typeDef = getTypeDefByRef(schema, ref);
    return bakeProperties(schema, typeDef);
  });

  // 첫 번째 variant의 properties를 기준으로 시작
  const firstVariantProps = allVariantProperties[0];
  if (!firstVariantProps) {
    return [];
  }

  const commonProperties: BakedProperty[] = [];

  // discriminator 필드를 공통 필드로 추가
  const discriminatorProp: BakedProperty = {
    name: discriminator.propertyName,
    type: "string",
    required: true,
    title: "Union Tag",
    description: "이 필드의 값에 따라 실제 타입이 결정됩니다",
  };
  commonProperties.push(discriminatorProp);

  // 각 필드가 모든 variant에 존재하는지 확인
  for (const prop of firstVariantProps) {
    // discriminator 필드는 이미 추가했으므로 건너뜀
    if (prop.name === discriminator.propertyName) {
      continue;
    }

    // 모든 variant에서 동일한 이름과 타입의 필드가 있는지 확인
    const isCommon = allVariantProperties.every((variantProps) => {
      const matchingProp = variantProps.find((p) => p.name === prop.name);
      if (!matchingProp) return false;

      // 타입이 동일한지 확인 (간단한 비교)
      // $ref가 있으면 $ref 비교, 없으면 type 비교
      if (prop.$ref && matchingProp.$ref) {
        return prop.$ref === matchingProp.$ref;
      }
      return prop.type === matchingProp.type;
    });

    if (isCommon) {
      // required는 모든 variant에서 required인 경우에만 true
      const isRequiredInAll = allVariantProperties.every((variantProps) => {
        const matchingProp = variantProps.find((p) => p.name === prop.name);
        return matchingProp?.required === true;
      });

      commonProperties.push({
        ...prop,
        required: isRequiredInAll,
      });
    }
  }

  return commonProperties;
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
  if (
    unwrapArray &&
    curr.type === "array" &&
    curr.items &&
    typeof curr.items === "object"
  ) {
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
  if ("additionalProperties" in def && def.additionalProperties)
    return "_additionalProperties";
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
      } else if (
        typeof parameter.schema?.items === "object" &&
        parameter.schema.items.$ref
      ) {
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
        .oneOf!.map(
          (def) =>
            def.$ref || (typeof def.items === "object" ? def.items.$ref : null),
        )
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
