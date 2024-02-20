import type { OpenApiSchema } from ".";
import { getCategories, type Category, flatCategories } from "./category";
import { getOperation } from "./operation";

export interface Endpoint {
  method: string; // get, post ...
  path: string;
  title: string;
  deprecated: boolean;
  unstable: boolean;
}

export interface CategoryEndpointsPair {
  category: Category;
  endpoints: Endpoint[];
}
export function groupEndpointsByCategory(
  schema: OpenApiSchema,
  endpoints: Endpoint[],
): CategoryEndpointsPair[] {
  const result: CategoryEndpointsPair[] = [];
  const map: { [categoryId: string]: Endpoint[] } = {};
  for (const endpoint of endpoints) {
    const operation = getOperation(schema, endpoint);
    const categoryId =
      operation?.["x-portone-category"] || operation?.tags?.[0];
    if (!categoryId) continue;
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

export function getEveryEndpoints(schema: OpenApiSchema): Endpoint[] {
  return Object.entries(schema.paths)
    .flatMap(([path, methods]) => {
      return Object.entries(methods).map(([method, operation]) => {
        if (!operation) return;
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
        } as Endpoint;
      });
    })
    .filter((v): v is Endpoint => Boolean(v));
}
