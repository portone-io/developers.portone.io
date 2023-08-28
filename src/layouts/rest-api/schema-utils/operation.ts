import type { Endpoint } from "./endpoint";

export interface Operation {
  summary?: string;
  description?: string;
  parameters?: Parameter[];
  responses: { [statusCode: number]: Response };
  tags?: string[];
}

export interface Parameter {
  name?: string;
  in?: string; // formData, path, query
  description?: string;
  required?: boolean;
  type?: string;
  "x-portone-name"?: string;
  "x-portone-summary"?: string;
  "x-portone-description"?: string;
}

export interface Response {
  description?: string;
  schema?: any;
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
  operation: Operation
): ResponseParameters {
  const result: ResponseParameters = [];
  for (const [statusCode, response] of Object.entries(operation.responses)) {
    const parameters: Parameter[] = []; // TODO
    result.push([statusCode, { response, parameters }]);
  }
  return result;
}
