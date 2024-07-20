import * as fs from "node:fs/promises";
import path from "node:path";

import { subscribe } from "@parcel/watcher";
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
import { type Plugin, unified } from "unified";
import { visit } from "unist-util-visit";

import type {
  CollectionConfig,
  Import,
  parseFrontmatter,
} from "./content/config";

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

const cwd = process.cwd();

async function getCollection(
  config: CollectionConfig,
  outputPath: string,
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
        outputPath,
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
  outputPath: string,
  parseFrontmatter: ParseFrontmatter,
) {
  const result = await unified()
    .use(remarkParse)
    .use(remarkStringify)
    .use(remarkMdx)
    .use(remarkGfm)
    .use(remarkFrontmatter)
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
    outputPath,
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

  const outputPath = path.join(
    import.meta.dirname,
    "./content/__generated__/index.ts",
  );

  const collections = new Map(
    await Promise.all(
      Object.entries(config).map(
        async ([name, config]) =>
          [
            name,
            await getCollection(config, outputPath, parseFrontmatter),
          ] as const,
      ),
    ),
  );

  await writeFile(collections, outputPath);
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

        void getCollection(config, outputPath, parseFrontmatter, files).then(
          (newCollection) => {
            if (!collection) {
              collections.set(name, newCollection);
              return;
            }
            for (const [slug, entry] of newCollection.entries) {
              collection.entries.set(slug, entry);
            }
            collections.set(name, collection);
            return writeFile(collections, outputPath);
          },
        );
      }),
    ),
  );

  return () => Promise.allSettled(subscriptions.map((s) => s.unsubscribe()));
}

async function writeFile(
  collections: Map<string, Collection>,
  outputPath: string,
) {
  const content = `// @vinxi-ignore-style-collection
/* eslint-disable */

import "#server-only";

${[...collections.values()]
  .flatMap(({ entries }) => [...entries.values()])
  .flatMap((entry) => entry.imports)
  .map(({ ident, path }) => `import ${ident} from "${path}";`)
  .join("\n")}

${[...collections]
  .map(
    ([name, c]) => `// prettier-ignore
export const ${name} = {
${[...c.entries.values()]
  .map(
    (entry) => `  ${JSON.stringify(entry.slug)}: {
    slug: ${JSON.stringify(entry.slug)},
    frontmatter: ${seroval.serialize(entry.frontmatter).replaceAll(/\{ident:"(import_[0-9a-fA-F]+?)"\}/g, "$1")},
    headings: ${JSON.stringify(entry.headings)},
  },`,
  )
  .join("\n")}
}`,
  )
  .join("\n\n")}
`;

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, content);
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
