import { query } from "@solidjs/router";

import { markdownToHtml } from "~/misc/server-md";

function processDescriptions(obj: unknown): unknown {
  if (obj == null || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(processDescriptions);
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    if (
      (key === "description" || key === "x-portone-description") &&
      typeof value === "string"
    ) {
      result[key] = markdownToHtml(value);
    } else {
      result[key] =
        typeof value === "object" && value !== null
          ? processDescriptions(value)
          : value;
    }
  }
  return result;
}

export const loadV2Schema = query(async () => {
  "use server";
  const schema = (await import("~/schema/v2.openapi.json")).default;
  return processDescriptions(schema);
}, "rest-api/v2-schema");

export const loadV1Schema = query(async () => {
  "use server";
  const schema = (await import("~/schema/v1.openapi.json")).default;
  return schema;
}, "rest-api/v1-schema");
