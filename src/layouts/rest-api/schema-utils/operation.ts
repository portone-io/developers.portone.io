import type { Endpoint } from "./endpoint";
import { bakeProperties, type TypeDef, type Property } from "./type-def";

export interface Operation {
  summary?: string | undefined;
  description?: string | undefined;
  requestBody?:
    | { content: { "application/json": { schema: TypeDef } } }
    | undefined;
  parameters?: Parameter[] | undefined;
  responses: { [statusCode: number]: Response };
  tags?: string[] | undefined;
}

export interface Parameter extends Property {
  name: string;
  in?: string | undefined; // formData, path, query
  required?: boolean | undefined;
  schema?: TypeDef | undefined;
}

export interface Response {
  description?: string | undefined;
  schema?: TypeDef | undefined;
  content?: { "application/json": { schema: TypeDef } };
}

export function getOperation(schema: any, endpoint: Endpoint): Operation {
  return schema.paths[endpoint.path][endpoint.method];
}

export function getPathParameters(operation: Operation): Parameter[] {
  return operation.parameters?.filter((p) => p.in === "path") || [];
}

export function getQueryParameters(operation: Operation): Parameter[] {
  return operation.parameters?.filter((p) => p.in === "query") || [];
}

export function getBodyParameters(
  schema: any,
  operation: Operation
): Parameter[] {
  const requestSchema =
    operation.requestBody?.content["application/json"]?.schema;
  if (requestSchema) return bakeProperties(schema, requestSchema);
  return (
    operation.parameters?.filter((p) => p.in !== "path" && p.in !== "query") ||
    []
  );
}

export type ResponseSchemata = [
  string /* statusCode */,
  {
    response: Response;
    schema?: TypeDef | undefined;
  }
][];
export function getResponseSchemata(operation: Operation): ResponseSchemata {
  const result: ResponseSchemata = [];
  for (const [statusCode, response] of Object.entries(operation.responses)) {
    const schema =
      response.content?.["application/json"]?.schema || response.schema;
    result.push([statusCode, { response, schema }]);
  }
  return result;
}
