import {
  type Category,
  flatCategories,
  getCategories,
  type Tag,
} from "./category";
import { getOperation, type Operation } from "./operation";

export interface Endpoint {
  method: string; // get, post ...
  path: string;
  title: string;
  deprecated: boolean;
  unstable: boolean;
}

export interface TagEndpointsPair {
  tag: Tag;
  endpoints: Endpoint[];
}
export function groupEndpointsByTag(
  schema: unknown,
  endpoints: Endpoint[],
): TagEndpointsPair[] {
  const s = schema as {
    tags: Tag[];
  };
  const result: TagEndpointsPair[] = [];
  const map: { [tagName: string]: Endpoint[] } = {};
  for (const endpoint of endpoints) {
    for (const tagName of getOperation(schema, endpoint).tags || []) {
      (map[tagName] ||= []).push(endpoint);
    }
  }
  for (const tag of s.tags) {
    result.push({ tag, endpoints: map[tag.name]! });
  }
  return result;
}

export interface CategoryEndpointsPair {
  category: Category;
  endpoints: Endpoint[];
}
export function groupEndpointsByCategory(
  schema: unknown,
  endpoints: Endpoint[],
): CategoryEndpointsPair[] {
  const result: CategoryEndpointsPair[] = [];
  const map: { [categoryId: string]: Endpoint[] } = {};
  for (const endpoint of endpoints) {
    const operation = getOperation(schema, endpoint);
    const categoryId =
      operation["x-portone-category"] || operation.tags?.[0] || "";
    (map[categoryId] ||= []).push(endpoint);
  }
  const categories = flatCategories(getCategories(schema));
  for (const category of categories) {
    const endpoints = map[category.id] || [];
    result.push({ category, endpoints });
  }
  return result;
}

export function getEndpointRepr({
  method,
  path,
}: Pick<Endpoint, "method" | "path">): string {
  return `${method} ${path}`;
}

export function getEveryEndpoints(schema: unknown): Endpoint[] {
  const s = schema as {
    paths: Record<string, Record<string, Operation>>;
  };
  return Object.entries(s.paths).flatMap(([path, methods]) => {
    return Object.entries(methods).map(([method, operation]) => {
      return {
        method,
        path,
        title:
          operation["x-portone-title"] ||
          operation.title ||
          operation.summary ||
          "",
        deprecated: Boolean(operation.deprecated),
        unstable: Boolean(operation["x-portone-unstable"]),
      };
    });
  });
}
