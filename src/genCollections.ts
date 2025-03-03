import * as fs from "node:fs/promises";
import path from "node:path";

import { subscribe } from "@parcel/watcher";
import remarkParamTree from "@portone-io/remark-param-tree";
import fastGlob from "fast-glob";
import Slugger from "github-slugger";
import jsYaml from "js-yaml";
import type { Root } from "mdast";
import { toString } from "mdast-util-to-string";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkMdx from "remark-mdx";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import * as seroval from "seroval";
import { match, P } from "ts-pattern";
import { type Plugin, unified } from "unified";
import { visit } from "unist-util-visit";

import type {
  CollectionConfig,
  config,
  Import,
  parseFrontmatter,
} from "~/content/config";
import { indexFilesMapping } from "~/misc/contentIndex";

import { makeReleaseNoteFrontmatter } from "./misc/releaseNote";

type Collection = {
  files: Set<string>;
  entries: Map<string, CollectionEntry>;
};

type CollectionEntry = {
  slug: string;
  file: string;
  frontmatter: unknown;
  headings: Heading[];
  imports: Import[];
};

type ParseFrontmatter = typeof parseFrontmatter;

export type Heading = {
  title: string;
  id: string;
  depth: number;
  children: Heading[];
};

type ObjectEntries<T> = T extends Record<infer K, infer V> ? [K, V][] : never;

const cwd = process.cwd();

async function getCollection(
  config: CollectionConfig,
  outDir: string,
  parseFrontmatter: ParseFrontmatter,
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
      const parsed = await parseMdx(
        config,
        file,
        content,
        outDir,
        parseFrontmatter,
      );
      return [slug, { slug, file, ...parsed }] as const;
    }),
  );

  return { files, entries: new Map(entries) };
}

async function parseMdx(
  config: CollectionConfig,
  fileName: string,
  content: string,
  outDir: string,
  parseFrontmatter: ParseFrontmatter,
) {
  const result = await unified()
    .use(remarkParse)
    .use(remarkStringify)
    .use(remarkMdx)
    .use(remarkGfm)
    .use(remarkFrontmatter)
    .use(remarkParamTree)
    .use(remarkHeadings)
    .use(function () {
      return function (_, file) {
        const match = file.toString().match(/^---\n([\s\S]*?)\n---\n/);
        file.data.frontmatter = match?.[1] ? jsYaml.load(match[1]) : {};
      };
    })
    .process(content);

  const data = result.data as {
    headings: Heading[];
    frontmatter: unknown;
  };

  const { imports, data: frontmatter } = await parseFrontmatter(
    fileName,
    outDir,
    data.frontmatter,
    config.entrySchema,
  );

  return {
    headings: data.headings,
    imports,
    frontmatter,
  };
}

async function generate(watch = false) {
  const { config, parseFrontmatter } = (await import(
    `./content/config?t=${Date.now()}`
  )) as typeof import("./content/config");

  const outDir = path.join(import.meta.dirname, "./content/__generated__");

  const collections = new Map(
    await Promise.all(
      (Object.entries(config) as ObjectEntries<typeof config>).map(
        async ([name, collectionConfig]) => {
          const collection = await getCollection(
            collectionConfig,
            outDir,
            parseFrontmatter,
          );
          await writeCollection(name, collection, outDir);
          return [name, collection] as const;
        },
      ),
    ),
  );

  await Promise.all([
    writeIndex(collections, outDir),
    writeSearchIndex(collections, outDir),
    writeThumbnail(collections, path.join(outDir, "client")),
  ]);
  if (!watch) return () => {};

  const subscriptions = await Promise.all(
    (Object.entries(config) as ObjectEntries<typeof config>).map(
      ([name, config]) =>
        subscribe(path.join(cwd, config.path), (err, events) => {
          if (err) {
            console.error(err);
            return;
          }

          let collection = collections.get(name);
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

          void getCollection(config, outDir, parseFrontmatter, files).then(
            async (newCollection) => {
              if (!collection) {
                collections.set(name, newCollection);
                collection = newCollection;
                await Promise.all([
                  writeCollection(name, collection, outDir),
                  writeSearchIndex(collections, outDir),
                  writeIndex(collections, outDir),
                ]);
              } else {
                for (const [slug, entry] of newCollection.entries) {
                  collection.entries.set(slug, entry);
                }
                await writeCollection(name, collection, outDir);
              }
            },
          );
        }),
    ),
  );

  return () => Promise.allSettled(subscriptions.map((s) => s.unsubscribe()));
}

async function writeCollection(
  name: string,
  collection: Collection,
  outDir: string,
) {
  const content = `// @vinxi-ignore-style-collection
/* eslint-disable */

import "#server-only";

${[...collection.entries.values()]
  .flatMap((entry) => entry.imports)
  .map(({ ident, path }) => `import ${ident} from "${path}";`)
  .join("\n")}

// prettier-ignore
export const ${name} = {
${[...collection.entries.values()]
  .map(
    (entry) => `  ${JSON.stringify(entry.slug)}: {
    file: ${JSON.stringify(entry.file)},
    slug: ${JSON.stringify(entry.slug)},
    frontmatter: ${seroval.serialize(entry.frontmatter).replaceAll(/\{ident:"(import_[0-9a-fA-F]+?)"\}/g, "$1")},
    headings: ${JSON.stringify(entry.headings)},
  },`,
  )
  .join("\n")}
};
`;

  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(path.join(outDir, `${name}.ts`), content);
}

async function writeIndex(
  collections: Map<string, Collection>,
  outDir: string,
) {
  const content = `// @vinxi-ignore-style-collection
/* eslint-disable */

import "#server-only";

${[...collections.keys()].map((name) => `import { ${name} } from "./${name}";`).join("\n")}

export { ${[...collections.keys()].join(", ")} };

export type Contents = {
${[...collections.keys()].map((name) => `  ${name}: typeof ${name};`).join("\n")}
};
`;

  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(path.join(outDir, "index.ts"), content);
}

async function writeThumbnail(
  collections: Map<string, Collection>,
  outDir: string,
) {
  const thumbnails = [...collections.values()]
    .flatMap((entry) => [...entry.entries.values()])
    .flatMap((entry) => entry.frontmatter as { thumbnail: { ident: string } }[])
    .map(({ thumbnail }) => thumbnail)
    .filter((thumbnail) => thumbnail && thumbnail.ident);
  const content = `// @vinxi-ignore-style-collection
/* eslint-disable */

${[...collections.values()]
  .flatMap((entry) => [...entry.entries.values()])
  .flatMap((entry) => [...entry.imports])
  .filter(({ ident }) => thumbnails.some((t) => t.ident === ident))
  .map(({ path }) => `import "../${path}";`)
  .join("\n")}
`;

  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(path.join(outDir, "thumbnail.ts"), content);
}

async function writeSearchIndex(
  collections: Map<keyof typeof config, Collection>,
  outDir: string,
) {
  await fs.mkdir(outDir, { recursive: true });

  console.log("Generating search index...");
  console.log(collections.get("sdk")?.entries.get("ko/readme"));

  for (const [indexType, mapping] of Object.entries(indexFilesMapping)) {
    const searchIndex = Object.entries(mapping).flatMap(
      ([key, collectionName]) => {
        const collection = collections.get(collectionName);
        if (!collection) return [];

        return [...collection.entries.values()].map((entry) => {
          const frontmatter = entry.frontmatter;
          const slug = entry.slug
            .replace(/\/index$/, "")
            .replace(/\/\([\w\d]+\)/, "");

          const {
            title,
            description,
          }: { title?: string; description?: string } = match(frontmatter)
            .with(
              { releasedAt: P.instanceOf(Date), slug: P.string },
              ({ releasedAt, slug }) =>
                makeReleaseNoteFrontmatter(releasedAt, slug),
            )
            .with(
              { title: P.string.optional(), description: P.string.optional() },
              ({ description, title }) => ({
                title,
                description,
              }),
            )
            .otherwise(() => ({}));

          return {
            key,
            slug,
            title,
            description,
            text:
              typeof frontmatter.content === "string"
                ? frontmatter.content
                : entry.headings.map((h) => h.title).join(" "),
          };
        });
      },
    );

    // Create Fuse.js index
    const fuseOptions = {
      keys: [
        { name: "title", weight: 3 },
        { name: "description", weight: 2 },
        { name: "text", weight: 1 },
      ],
    };
    const fuse = new Fuse(searchIndex, fuseOptions);
    const fuseIndex = fuse.getIndex();

    // Write both indices to files
    const data = { fuseIndex, searchIndex };
    await fs.writeFile(
      path.join(outDir, `search-${indexType}.json`),
      JSON.stringify(data, null, 2),
    );

    console.log(`Generated search index for ${indexType}`);
  }
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

function remarkHeadings(): ReturnType<Plugin<[], Root>> {
  return function (tree, file) {
    const headings: Heading[] = [];
    const slugger = new Slugger();
    let stack: Heading[] = [];

    visit(tree, "heading", (node) => {
      const value = toString(node, { includeImageAlt: false });
      const newHeading: Heading = {
        title: value,
        id: slugger.slug(value),
        depth: node.depth,
        children: [],
      };

      const parent = stack.findLast((h) => h.depth < node.depth);
      if (!parent) {
        headings.push(newHeading);
        stack = [newHeading];
      } else {
        parent.children.push(newHeading);
        stack.splice(
          stack.indexOf(parent) + 1,
          Number.POSITIVE_INFINITY,
          newHeading,
        );
      }
    });

    file.data.headings = headings;
  };
}
