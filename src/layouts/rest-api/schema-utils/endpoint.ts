import { type Operation, getOperation } from "./operation";

export interface Endpoint {
  method: string; // get, post ...
  path: string;
  title: string;
  deprecated: boolean;
  unstable: boolean;
}

export interface Tag {
  name: string;
  description: string;
}
export interface TagEndpointsPair {
  tag: Tag;
  endpoints: Endpoint[];
}
export function groupEndpointsByTag(
  schema: any,
  endpoints: Endpoint[]
): TagEndpointsPair[] {
  const result: TagEndpointsPair[] = [];
  const map: { [tagName: string]: Endpoint[] } = {};
  for (const endpoint of endpoints) {
    for (const tagName of getOperation(schema, endpoint).tags || []) {
      (map[tagName] ||= []).push(endpoint);
    }
  }
  for (const tag of schema.tags) {
    result.push({ tag, endpoints: map[tag.name]! });
  }
  return result;
}

export function getEndpointRepr({ method, path }: Endpoint): string {
  return `${method} ${path}`;
}

export function getEveryEndpoints(schema: any): Endpoint[] {
  return Object.entries(schema.paths).flatMap(([path, methods]) => {
    return Object.entries(methods as any).map(([method, _operation]) => {
      const operation = _operation as Operation;
      return {
        method,
        path,
        title: operation.summary || "",
        deprecated: Boolean(operation.deprecated),
        unstable: Boolean(operation["x-portone-unstable"]),
      } as Endpoint;
    });
  });
}
