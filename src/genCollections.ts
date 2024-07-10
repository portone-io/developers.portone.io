import * as fs from "node:fs/promises";
import path from "node:path";

import { subscribe } from "@parcel/watcher";
import fastGlob from "fast-glob";
import jsYaml from "js-yaml";
import * as seroval from "seroval";

import { type CollectionConfig } from "./content/config";

type Collection = {
  files: Set<string>;
  entries: Map<string, CollectionEntry>;
};

type CollectionEntry = {
  slug: string;
  frontmatter: unknown;
  file: string;
};

async function getCollection(
  config: CollectionConfig,
  changedFiles?: Set<string>,
): Promise<Collection> {
  let files = changedFiles;
  if (!files) {
    const allFiles = await fastGlob(`content/${config.path}/**/*.mdx`, {
      cwd: import.meta.dirname,
    });
    files = new Set(allFiles.filter((path) => !path.includes("/_")));
  }

  const slugRegex = new RegExp(`^.*?/${config.path}/([\\s\\S]+)\\.mdx$`);

  const entries = await Promise.all(
    [...files].map(async (file) => {
      const slug = slugRegex.exec(file)?.[1] ?? "";
      const content = await fs.readFile(
        path.join(import.meta.dirname, file),
        "utf-8",
      );
      const frontmatter = getFrontmatter(config, file, content);
      return [slug, { slug, frontmatter, file }] as const;
    }),
  );

  return { files, entries: new Map(entries) };
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

async function generate(
  previous?: Map<string, Collection>,
  changedFilesMap?: Map<string, Set<string>>,
) {
  const { config } = (await import(
    `./content/config?t=${Date.now()}`
  )) as typeof import("./content/config");

  const collections = new Map<string, Collection>();

  if (previous && changedFilesMap) {
    for (const [name, collection] of previous) {
      if (!Object.keys(changedFilesMap).includes(name)) {
        collections.set(name, collection);
      }
    }
    for (const [name, files] of changedFilesMap) {
      const updated = await getCollection(
        config[name as keyof typeof config],
        files,
      );
      collections.set(name, {
        files: new Set([
          ...(previous.get(name)?.files ?? []),
          ...updated.files,
        ]),
        entries: new Map([
          ...(previous.get(name)?.entries ?? []),
          ...updated.entries,
        ]),
      });
    }
  } else {
    const entries = await Promise.all(
      Object.entries(config).map(
        async ([name, config]) => [name, await getCollection(config)] as const,
      ),
    );

    for (const [name, collection] of entries) {
      collections.set(name, collection);
    }
  }

  const content = `${[...collections]
    .map(
      ([name, c]) => `// prettier-ignore
export const ${name} = {
${[...c.entries.values()]
  .map(
    (entry) => `  ${JSON.stringify(entry.slug)}: {
    slug: ${JSON.stringify(entry.slug)},
    frontmatter: ${seroval.serialize(entry.frontmatter)},
    load: () => import(${JSON.stringify(`~/${entry.file}`)}),
  },`,
  )
  .join("\n")}
}`,
    )
    .join("\n\n")}
`;

  const file = path.join(
    import.meta.dirname,
    "./content/__generated__/index.ts",
  );

  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, content);

  return { collections };
}

if (process.argv[2] === "watch") {
  let collections: Map<string, Collection> | undefined;

  try {
    const result = await generate();
    collections = result.collections;
  } catch (e) {
    console.error(e);
  }

  await subscribe(
    path.join(import.meta.dirname, "./content"),
    async (error, events) => {
      if (error) {
        console.error(error);
        return;
      }

      let changedFilesMap: Map<string, Set<string>> | undefined;

      if (collections) {
        changedFilesMap = new Map();

        for (const event of events) {
          if (event.type === "update") {
            for (const [name, collection] of collections) {
              const relativePath = path.relative(
                import.meta.dirname,
                event.path,
              );
              if (collection.files.has(relativePath)) {
                if (!changedFilesMap.has(name)) {
                  changedFilesMap.set(name, new Set());
                }
                changedFilesMap.get(name)?.add(relativePath);
              }
            }
          } else {
            changedFilesMap = undefined;
            break;
          }
        }
      }

      try {
        const result = await generate(collections, changedFilesMap);
        collections = result.collections;
      } catch (e) {
        console.error(e);
      }
    },
    { ignore: ["__generated__"] },
  );
} else {
  await generate();
}
