import type { Endpoint } from "./endpoint";

export interface Operation {
  summary?: string;
  description?: string;
  parameters: { in: string; name?: string; description?: string }[];
  responses: { [statusCode: number]: any };
  tags?: string[];
}

export function getOperation(schema: any, endpoint: Endpoint): Operation {
  return schema.paths[endpoint.path][endpoint.method];
}
