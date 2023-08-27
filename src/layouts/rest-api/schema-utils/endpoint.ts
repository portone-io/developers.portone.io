import { getOperation } from "./operation";

export interface Endpoint {
  method: string; // get, post ...
  path: string;
  title: string;
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

export function getEveryEndpoints(schema: any): Endpoint[] {
  return Object.entries(schema.paths).flatMap(([path, methods]) => {
    return Object.entries(methods as any).map(
      ([method, operation]) =>
        ({
          method,
          path,
          title: (operation as any).summary,
        } as Endpoint)
    );
  });
}
