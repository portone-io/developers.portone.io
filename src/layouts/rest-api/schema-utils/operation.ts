import type { Endpoint } from "./endpoint";
import { bakeProperties, type Property } from "./type-def";

export interface Operation {
  summary?: string | undefined;
  description?: string | undefined;
  parameters?: Parameter[] | undefined;
  responses: { [statusCode: number]: Response };
  tags?: string[] | undefined;
}

export interface Parameter extends Property {
  name: string;
  in?: string | undefined; // formData, path, query
  required?: boolean | undefined;
}

export interface Response {
  description?: string | undefined;
  schema?: any | undefined;
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

export function getBodyParameters(operation: Operation): Parameter[] {
  return (
    operation.parameters?.filter((p) => p.in !== "path" && p.in !== "query") ||
    []
  );
  // TODO: openapi 3.0
}

export type ResponseParameters = [
  string /* statusCode */,
  {
    response: Response;
    parameters: Parameter[];
  }
][];
export function getResponseParameters(
  schema: any,
  operation: Operation
): ResponseParameters {
  const result: ResponseParameters = [];
  for (const [statusCode, response] of Object.entries(operation.responses)) {
    const parameters: Parameter[] = response.schema
      ? bakeProperties(schema, response.schema)
      : [];
    result.push([statusCode, { response, parameters }]);
  }
  return result;
}
