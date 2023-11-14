#!/usr/bin/env -S deno run -A

import { parse as parseYaml } from "https://deno.land/std@0.197.0/yaml/mod.ts";

run("ko");

interface ResultItem {
  path: string;
  label: string;
  systemVersion?: string;
}
type Result = ResultItem[];

async function run(lang: string): Promise<Result> {
  const result: Result = [];
  const navYaml = await Deno.readTextFile(`src/content/docs/${lang}/_nav.yaml`);
  const navArr = parseYaml(navYaml) as any[];
  for (const item of traverse(navArr)) {
    const titles = await Promise.all(item.paths.map(getTitleFromPath));
    console.log(`${item.slug}\t${titles.join(" - ")}`);
  }
  return result;
}

const titleCache: Record<string, string> = {};
async function getTitleFromPath(path: string): Promise<string> {
  if (path.startsWith("!")) return path.slice(1);
  return titleCache[path] ||= getTitle(
    await Deno.readTextFile(`src/content/docs${path}.mdx`),
  );
}

function getTitle(mdx: string): string {
  const match = /^\s*---\r?\n((?:.|\r|\n)+?)---\r?\n/m.exec(mdx);
  if (!match) return "";
  return String((parseYaml(match[1]) as any)?.title || "");
}

interface TraverseItem {
  paths: string[];
  slug: string;
  ref: any;
}
function* traverse(
  navArr: any[],
  paths: string[] = [],
): Generator<TraverseItem> {
  for (const item of navArr) {
    if (typeof item === "string") {
      yield { paths: [...paths, item], ref: item, slug: item };
    } else if ("slug" in item) {
      const prefix = [...paths, item.slug];
      yield { paths: prefix, ref: item, slug: item.slug };
      if (item.items) yield* traverse(item.items, prefix);
    } else if ("label" in item && item.items) {
      yield* traverse(item.items, [`!${item.label}`]);
    }
  }
}
