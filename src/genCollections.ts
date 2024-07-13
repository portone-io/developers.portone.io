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

const cwd = process.cwd();

async function getCollection(
  config: CollectionConfig,
  changedFiles?: Set<string>,
): Promise<Collection> {
  let files = changedFiles;
  if (!files) {
    const allFiles = await fastGlob(
      `${fastGlob.escapePath(config.path)}/**/*.mdx`,
    );
    files = new Set(allFiles.filter((path) => !path.includes("/_")));
  }

  const slugRegex = new RegExp(
    `^${config.path
      .replaceAll(/\(/g, "\\(")
      .replaceAll(/\)/g, "\\)")}/([\\s\\S]+)\\.mdx$`,
  );

  const entries = await Promise.all(
    [...files].map(async (file) => {
      const slug = slugRegex.exec(file)?.[1]?.replace(/\/index$/, "") ?? "";
      const content = await fs.readFile(file, "utf-8");
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

async function generate(watch = false) {
  const { config } = (await import(
    `./content/config?t=${Date.now()}`
  )) as typeof import("./content/config");

  const collections = new Map(
    await Promise.all(
      Object.entries(config).map(
        async ([name, config]) => [name, await getCollection(config)] as const,
      ),
    ),
  );

  await writeFile(collections);
  if (!watch) return () => {};

  const subscriptions = await Promise.all(
    Object.entries(config).map(([name, config]) =>
      subscribe(path.join(cwd, config.path), (err, events) => {
        if (err) {
          console.error(err);
          return;
        }

        const collection = collections.get(name);
        let files: Set<string> | undefined;

        for (const event of events) {
          const file = path.relative(cwd, event.path);
          if (event.type === "update" && collection?.files.has(file)) {
            if (!files) files = new Set();
            files.add(file);
          } else {
            files = undefined;
            break;
          }
        }

        void getCollection(config, files).then((newCollection) => {
          if (!collection) {
            collections.set(name, newCollection);
            return;
          }

          for (const [slug, entry] of newCollection.entries) {
            collection.entries.set(slug, entry);
          }
          collections.set(name, collection);
          return writeFile(collections);
        });
      }),
    ),
  );

  return () => Promise.allSettled(subscriptions.map((s) => s.unsubscribe()));
}

async function writeFile(collections: Map<string, Collection>) {
  const content = `// @vinxi-ignore-style-collection

import "#server-only";

${[...collections]
  .map(
    ([name, c]) => `// prettier-ignore
export const ${name} = {
${[...c.entries.values()]
  .map(
    (entry) => `  ${JSON.stringify(entry.slug)}: {
    slug: ${JSON.stringify(entry.slug)},
    frontmatter: ${seroval.serialize(entry.frontmatter)},
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
}

if (process.argv[2] === "watch") {
  try {
    let dispose: () => (void | Promise<void>) | undefined =
      await generate(true);

    await subscribe(
      path.join(import.meta.dirname, "./content"),
      async (error) => {
        await dispose?.();
        if (error) {
          console.error(error);
          return;
        }

        try {
          dispose = await generate(true);
        } catch (e) {
          console.error(e);
        }
      },
      { ignore: ["__generated__"] },
    );
  } catch (e) {
    console.error(e);
  }
} else {
  await generate();
}
