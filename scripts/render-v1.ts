#!/usr/bin/env -S deno run -A

import { ensureFile } from "https://deno.land/std@0.197.0/fs/ensure_file.ts";
import { render as renderGfm } from "https://deno.land/x/gfm@0.2.5/mod.ts";

const mdProperties = new Set([
  "summary",
  "description",
  "x-portone-summary",
  "x-portone-description",
]);

const schema = JSON.parse(
  await Deno.readTextFile(
    new URL(import.meta.resolve("../src/schema/v1-tmp.openapi.json")),
  ),
);

traverseEveryProperty(schema, (node, property, context) => {
  if (property === "x-portone-per-pg") {
    context.renderAll = true;
    return;
  }
  if (typeof node[property] !== "string") return;
  if (!mdProperties.has(property)) return;
  if (!context.renderAll && !property.startsWith("x-")) return;
  node[property] = renderGfm(node[property]);
});

const json = JSON.stringify(schema, null, 2);
await touchAndSaveText(
  import.meta.resolve("../src/schema/v1.openapi.json"),
  json,
);

function traverseEveryProperty(
  object: any,
  fn: (node: any, property: string, context: any) => void,
  context: any = {},
) {
  if (!object) return;
  if (typeof object !== "object") return;
  if (Array.isArray(object)) {
    for (const item of object) traverseEveryProperty(item, fn, context);
  } else {
    for (const property in object) {
      const subcontext = { ...context };
      fn(object, property, subcontext);
      traverseEveryProperty(object[property], fn, subcontext);
    }
  }
}

async function touchAndSaveText(resolvedPath: string, text: string) {
  const url = new URL(resolvedPath);
  await ensureFile(url);
  await Deno.writeTextFile(url, text);
}
