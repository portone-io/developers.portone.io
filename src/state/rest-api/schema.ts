import { createSignal } from "solid-js";
import type { OpenApiSchema } from "~/layouts/rest-api/schema-utils";

export const [schema, setSchema] = createSignal<OpenApiSchema>(
  {} as OpenApiSchema,
);
