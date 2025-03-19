#!/usr/bin/env -S deno run -A

import { walkSync } from "jsr:@std/fs@1.0.2/walk";
import { stringify } from "jsr:@std/yaml@1.0.4";

import schema from "../src/schema/v1.openapi.json" with { type: "json" };

const redirList = [];

for (const { isFile, path } of walkSync("src/content/docs/ko/api")) {
  if (!isFile) continue;
  const text = Deno.readTextFileSync(path);
  const pattern = /<Swagger.+?method="(.+?)".+?path="\s*(.+?)\s*"/;
  const match = pattern.exec(text);
  if (!match) continue;
  const [_, method, apipath] = match;
  const op = (schema as any).paths?.[apipath]?.[method];
  const category = op?.["x-portone-category"] || "";
  const redir = {
    old: path.slice("src/content/docs".length, -".mdx".length),
    new: `https://developers.portone.io/api/rest-v1/${category}#${encodeURIComponent(
      `${method} ${apipath}`,
    )}`,
  };
  redirList.push(redir);
}

console.log(stringify(redirList));
