import * as fs from "node:fs/promises";

import {
  type Category,
  getCategories,
} from "../layouts/rest-api/schema-utils/category.ts";
import {
  type CategoryEndpointsPair,
  getEmptyCategoryIds,
  getEveryEndpoints,
  groupEndpointsByCategory,
} from "../layouts/rest-api/schema-utils/endpoint.ts";
import { crawlRefs } from "../layouts/rest-api/schema-utils/type-def.ts";
import { markdownToHtml } from "../misc/server-md.ts";

type RestApiVersion = "v1" | "v2";

type SchemaSubset =
  | {
      paths: Record<string, Record<string, unknown>>;
      components: { schemas: Record<string, unknown> };
    }
  | {
      paths: Record<string, Record<string, unknown>>;
      definitions: Record<string, unknown>;
    };

interface GeneratedOverviewGroup {
  category: Category;
  endpointCount: number;
}

interface GeneratedCategoryData {
  group: CategoryEndpointsPair;
  schema: SchemaSubset;
  redirect?: string;
}

const versions = ["v1", "v2"] as const satisfies RestApiVersion[];
const outRootUrl = new URL(
  "../layouts/rest-api/__generated__/",
  import.meta.url,
);

await generate();

async function generate() {
  await fs.rm(outRootUrl, { recursive: true, force: true });
  await writeGeneratedIndex();

  for (const version of versions) {
    await generateVersion(version);
  }
}

async function generateVersion(version: RestApiVersion) {
  const schema = await loadSchema(version);
  const processedSchema =
    version === "v2" ? processDescriptions(schema) : schema;

  const categories = getCategories(processedSchema);
  const everyEndpoints = getEveryEndpoints(processedSchema);
  const endpointGroups = groupEndpointsByCategory(
    processedSchema,
    everyEndpoints,
  );
  const emptyIds = Array.from(
    getEmptyCategoryIds(processedSchema, everyEndpoints),
  ).sort();
  const emptyIdSet = new Set(emptyIds);

  const overviewGroups: GeneratedOverviewGroup[] = endpointGroups
    .filter(({ endpoints }) => endpoints.length > 0)
    .map(({ category, endpoints }) => ({
      category,
      endpointCount: endpoints.length,
    }));

  await writeJson(new URL(`./${version}/nav.json`, outRootUrl), {
    categories,
    emptyIds,
  });
  await writeJson(
    new URL(`./${version}/overview.json`, outRootUrl),
    overviewGroups,
  );

  for (const group of endpointGroups) {
    const data: GeneratedCategoryData =
      group.endpoints.length > 0
        ? {
            group,
            schema: buildMinimalSchema(processedSchema, group, version),
          }
        : {
            group,
            schema: buildMinimalSchema(processedSchema, group, version),
            redirect: computeRedirect(
              categories,
              emptyIdSet,
              group.category.id,
            ),
          };

    await writeJson(
      new URL(`./${version}/categories/${group.category.id}.json`, outRootUrl),
      data,
    );
  }
}

async function loadSchema(version: RestApiVersion): Promise<unknown> {
  const schemaPath = new URL(
    `../schema/${version}.openapi.json`,
    import.meta.url,
  );
  const content = await fs.readFile(schemaPath, "utf-8");
  return JSON.parse(content) as unknown;
}

function processDescriptions(obj: unknown): unknown {
  if (obj == null || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(processDescriptions);

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (
      (key === "description" || key === "x-portone-description") &&
      typeof value === "string"
    ) {
      result[key] = markdownToHtml(value);
      continue;
    }

    result[key] =
      typeof value === "object" && value !== null
        ? processDescriptions(value)
        : value;
  }

  return result;
}

function buildMinimalSchema(
  schema: unknown,
  group: CategoryEndpointsPair,
  version: RestApiVersion,
): SchemaSubset {
  const s = schema as {
    paths: Record<string, Record<string, unknown>>;
    components?: { schemas?: Record<string, unknown> };
    definitions?: Record<string, unknown>;
  };

  const paths: Record<string, Record<string, unknown>> = {};
  for (const endpoint of group.endpoints) {
    const operation = s.paths[endpoint.path]?.[endpoint.method];
    if (!operation) continue;
    (paths[endpoint.path] ||= {})[endpoint.method] = operation;
  }

  const refs = crawlRefs(schema, [group]);

  if (version === "v2") {
    const schemas: Record<string, unknown> = {};
    for (const ref of refs) {
      const name = ref.split("/").pop();
      if (!name) continue;
      const typeDef = s.components?.schemas?.[name];
      if (typeDef) schemas[name] = typeDef;
    }
    return { paths, components: { schemas } };
  }

  const definitions: Record<string, unknown> = {};
  for (const ref of refs) {
    const name = ref.split("/").pop();
    if (!name) continue;
    const typeDef = s.definitions?.[name];
    if (typeDef) definitions[name] = typeDef;
  }
  return { paths, definitions };
}

function computeRedirect(
  categories: Category[],
  emptyIds: Set<string>,
  categoryId: string,
): string {
  const parent = categories.find((category) => category.id === categoryId);
  if (parent?.children) {
    const firstChild = parent.children.find((child) => !emptyIds.has(child.id));
    if (firstChild) return firstChild.id;
  }
  return "overview";
}

async function writeGeneratedIndex() {
  const content = `/* eslint-disable */

import type { Category } from "../schema-utils/category";
import type { CategoryEndpointsPair } from "../schema-utils/endpoint";

export type RestApiVersion = "v1" | "v2";

export interface NavData {
  categories: Category[];
  emptyIds: string[];
}

export interface OverviewGroup {
  category: Category;
  endpointCount: number;
}

export interface CategoryData {
  group: CategoryEndpointsPair;
  schema: unknown;
  redirect?: string;
}

export type CategoryLoader = () => Promise<CategoryData>;

const navDataByVersion = import.meta.glob("./*/nav.json", {
  eager: true,
  import: "default",
}) as Record<string, NavData>;

const overviewDataByVersion = import.meta.glob("./*/overview.json", {
  eager: true,
  import: "default",
}) as Record<string, OverviewGroup[]>;

const categoryLoadersByVersion = {
  v1: import.meta.glob("./v1/categories/*.json", {
    import: "default",
  }) as Record<string, CategoryLoader>,
  v2: import.meta.glob("./v2/categories/*.json", {
    import: "default",
  }) as Record<string, CategoryLoader>,
} satisfies Record<RestApiVersion, Record<string, CategoryLoader>>;

export function getNavData(version: RestApiVersion): NavData {
  const data = navDataByVersion[\`./\${version}/nav.json\`];
  if (!data) {
    throw new Error(\`Missing generated REST API nav data for \${version}\`);
  }
  return data;
}

export function getOverviewData(version: RestApiVersion): OverviewGroup[] {
  const data = overviewDataByVersion[\`./\${version}/overview.json\`];
  if (!data) {
    throw new Error(\`Missing generated REST API overview data for \${version}\`);
  }
  return data;
}

export async function loadGeneratedCategoryData(
  version: RestApiVersion,
  categoryId: string,
): Promise<CategoryData | undefined> {
  const loader =
    categoryLoadersByVersion[version][\`./\${version}/categories/\${categoryId}.json\`];
  return loader?.();
}

export function createFallbackCategoryData(categoryId: string): CategoryData {
  return {
    group: {
      category: { id: categoryId, title: "" },
      endpoints: [],
    },
    schema: { paths: {} },
    redirect: "overview",
  };
}
`;

  await fs.mkdir(outRootUrl, { recursive: true });
  await fs.writeFile(new URL("./index.ts", outRootUrl), content);
}

async function writeJson(fileUrl: URL, data: unknown) {
  await fs.mkdir(new URL(".", fileUrl), { recursive: true });
  await fs.writeFile(fileUrl, `${JSON.stringify(data, null, 2)}\n`);
}
