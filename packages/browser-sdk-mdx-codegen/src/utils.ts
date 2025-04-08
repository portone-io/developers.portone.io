import { pascalCase } from "es-toolkit/string";

import { getResourceRef } from "./schema.ts";

export const getComponentName = (ref: string) =>
  pascalCase(getResourceRef(ref).replaceAll("/", "_"));
