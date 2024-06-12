import * as fs from "node:fs/promises";
import path from "node:path";

import { subscribe } from "@parcel/watcher";
import fastGlob from "fast-glob";
import jsYaml from "js-yaml";

import { type CollectionConfig } from "./content/config";

async function getCollection(name: string, config: CollectionConfig) {
  const allPaths = await fastGlob(`./content/${config.path}/**/*.mdx`, {
    cwd: import.meta.dirname,
  });
  const paths = allPaths.filter((path) => !path.includes("/_"));
  const slugRegex = new RegExp(`^.*?/${config.path}/([\\s\\S]+)\\.mdx$`);

  const entries = await Promise.all(
    paths.map(async (file) => {
      const slug = slugRegex.exec(file)?.[1];
      const content = await fs.readFile(
        path.join(import.meta.dirname, file),
        "utf-8",
      );
      const frontmatter = getFrontmatter(config, file, content);
      return {
        slug,
        code: `{
  slug: ${JSON.stringify(slug)},
  frontmatter: ${JSON.stringify(frontmatter, null, 2).replace(/\n/g, "\n  ")},
  load: () => import(${JSON.stringify(`~/${file}`)}),
}`,
      };
    }),
  );

  return `export const ${name} = {
${entries.map((entry) => `  ${JSON.stringify(entry.slug)}: ${entry.code.replace(/\n/g, "\n  ")},`).join("\n")}
}`;
}

function getFrontmatter(
  config: CollectionConfig,
  path: string,
  content: string,
) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n/);
  if (match?.[1]) {
    return config.entrySchema.parse(jsYaml.load(match[1]));
  } else throw new Error(`Frontmatter not found in ${path}`);
}

async function generate() {
  const { config } = (await import(
    `./content/config?t=${Date.now()}`
  )) as typeof import("./content/config");

  const collections = await Promise.all(
    Object.entries(config).map(([name, config]) => getCollection(name, config)),
  );

  const content = `// prettier-ignore

${collections.join("\n\n")}
`;

  const file = path.join(
    import.meta.dirname,
    "./content/__generated__/index.ts",
  );

  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, content);
}

if (process.argv[2] === "watch") {
  await generate();
  await subscribe(
    path.join(import.meta.dirname, "./content"),
    () => generate(),
    { ignore: ["__generated__"] },
  );
} else {
  await generate();
}
