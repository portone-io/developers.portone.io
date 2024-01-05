#!/usr/bin/env -S deno run -A

import { processV1Openapi, touchAndSaveText } from "./download-schema.ts";

const schema = processV1Openapi(
  JSON.parse(
    await Deno.readTextFile(
      new URL(import.meta.resolve("../src/schema/v1-tmp.openapi.json")),
    ),
  ),
);

const json = JSON.stringify(schema, null, 2);
await touchAndSaveText(
  import.meta.resolve("../src/schema/v1.openapi.json"),
  json,
);
