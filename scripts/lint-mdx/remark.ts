import { pathToFileURL } from "node:url";

import remarkMdx from "remark-mdx";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import { type Pluggable, type Plugin, unified } from "unified";

type PluginEntry = string | Plugin | [string | Plugin, ...unknown[]];

interface RemarkConfig {
  plugins: PluginEntry[];
  settings?: Record<string, unknown>;
}

/** `.remarkrc.js` 설정으로 MDX 린트용 unified processor를 만듭니다. */
export async function createProcessor(configPath: string) {
  const { default: config } = (await import(
    pathToFileURL(configPath).href
  )) as { default: RemarkConfig };

  const plugins = await Promise.all(
    config.plugins.map(async (entry): Promise<Pluggable> => {
      const [plugin, ...options] = Array.isArray(entry) ? entry : [entry];
      const resolved =
        typeof plugin === "string"
          ? ((await import(plugin)) as { default: Plugin }).default
          : plugin;
      return [resolved, ...options] as Pluggable;
    }),
  );

  return unified()
    .use(remarkParse)
    .use(remarkMdx)
    .use(remarkStringify)
    .use(plugins)
    .data("settings", config.settings)
    .freeze();
}
