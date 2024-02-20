export type OpenApiSchema = {
  info: {
    title: string;
    version: string;
    "x-portone-categories"?: PortOneCategory[];
  };
  paths: {
    [_: string]: {
      [_ in string]?: Operation;
    };
  };
  tags?: {
    name: string;
    description: string;
  }[];
  "x-portone-categories"?: PortOneCategory[];
};

export interface Operation {
  operationId?: string | undefined;
  title?: string | undefined;
  summary?: string | undefined;
  description?: string | undefined;
  requestBody?:
    | { content: { "application/json": { schema: TypeDef } } }
    | undefined;
  parameters?: Parameter[] | undefined;
  responses: { [statusCode: number]: Response };
  tags?: string[] | undefined;
  deprecated?: boolean | undefined;
  "x-portone-title"?: string | undefined;
  "x-portone-summary"?: string | undefined;
  "x-portone-description"?: string | undefined;
  "x-portone-unstable"?: boolean | undefined;
  "x-portone-category"?: string | undefined;
}

export interface Response {
  description?: string | undefined;
  schema?: TypeDef | undefined;
  content?: { "application/json": { schema: TypeDef } };
}

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

export interface Parameter extends Property {
  name: string;
  in?: string | undefined; // formData, path, query
  required?: boolean | undefined;
  schema?: TypeDef | undefined;
}

interface PortOneCategory {
  id: string;
  title: string;
  description: string;
  children?: {
    id: string;
    title: string;
    description: string;
  }[];
}
