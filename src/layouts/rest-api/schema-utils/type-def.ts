export interface TypeDef {
  $ref?: string | undefined;
  allOf?: TypeDef[] | undefined;
  summary?: string | undefined;
  description?: string | undefined;
  type?: string | undefined;
  required?: string[] | undefined;
  properties?: Properties | undefined;
  "x-portone-name"?: string | undefined;
  "x-portone-summary"?: string | undefined;
  "x-portone-description"?: string | undefined;
}

export interface Properties {
  [name: string]: Property;
}

export interface Property {
  $ref?: string | undefined;
  summary?: string | undefined;
  description?: string | undefined;
  type?: string | undefined;
  "x-portone-name"?: string | undefined;
  "x-portone-summary"?: string | undefined;
  "x-portone-description"?: string | undefined;
}

export interface BakedProperty extends Property {
  name: string;
  required: boolean;
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

export function resolveTypeDef(schema: any, typeDef: TypeDef): TypeDef {
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

export function followRef(schema: any, typeDef: TypeDef): TypeDef {
  let curr = typeDef;
  while (curr.$ref) curr = getTypeDefByRef(schema, curr.$ref);
  return curr;
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
