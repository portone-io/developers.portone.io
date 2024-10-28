import { AsyncLocalStorage } from "node:async_hooks";
import { readFile } from "node:fs/promises";
import * as path from "node:path";

import Sharp from "sharp";
import type { Picture } from "vite-imagetools";
import { z } from "zod";

import { SystemVersion } from "~/type";

export interface ParseContext {
  fileName: string;
  outDir: string;
  registerImport: (importData: Import) => void;
}
export interface Import {
  ident: string;
  path: string;
}
const ParseContext = new AsyncLocalStorage<ParseContext>();

export const parseFrontmatter = async <T>(
  fileName: string,
  outDir: string,
  content: unknown,
  schema: z.ZodSchema<T>,
) => {
  const imports: Import[] = [];
  const data = await ParseContext.run(
    {
      fileName,
      outDir,
      registerImport: (importData) => {
        imports.push(importData);
      },
    },
    async () => {
      return await schema.parseAsync(content);
    },
  );
  return { imports, data };
};

const image = () =>
  z.string().transform(async (input): Promise<Picture> => {
    try {
      const metadata = await fetch(new URL(input))
        .then((res) => res.arrayBuffer())
        .then((buf) => Sharp(buf))
        .then((img) => img.metadata());
      return {
        img: {
          src: input,
          w: metadata.width ?? 0,
          h: metadata.height ?? 0,
        },
        sources: {},
      };
    } catch {
      const ctx = ParseContext.getStore()!;
      const absPath = path.join(path.dirname(ctx.fileName), input);
      const relativePath = path.relative(ctx.outDir, absPath);
      void Sharp(await readFile(absPath)); // validate image
      const ident = `import_${crypto.randomUUID().replaceAll(/-/g, "")}`;
      ctx.registerImport({ ident, path: relativePath });
      return { ident } as unknown as Picture; // will be replaced by script
    }
  });

const DocsEntry = z.object({
  title: z.string(),
  description: z.string(),
  targetVersions: z.array(SystemVersion).optional(),
  versionVariants: z.record(SystemVersion, z.string()).optional(),
});
export type DocsEntry = z.infer<typeof DocsEntry>;

const BlogEntry = z.object({
  title: z.string(),
  description: z.string(),
  date: z.date(),
  author: z.string(),
  tags: z.array(z.string()),
  thumbnail: image(),
  draft: z.boolean().optional(),
});
export type BlogEntry = z.infer<typeof BlogEntry>;

const ReleaseNoteEntry = z.object({
  releasedAt: z.date(),
  writtenAt: z.date(),
});
export type ReleaseNoteEntry = z.infer<typeof ReleaseNoteEntry>;

const ApiSectionDescriptionEntry = z.object({});
export type ApiSectionDescriptionEntry = z.infer<
  typeof ApiSectionDescriptionEntry
>;

const PlatformEntry = z.object({
  title: z.string(),
  no: z.number(),
});
export type PlatformEntry = z.infer<typeof PlatformEntry>;

export const config = {
  opi: {
    path: "src/routes/(root)/opi",
    entrySchema: DocsEntry,
  },
  releaseNotes: {
    path: "src/routes/(root)/release-notes/(note)",
    entrySchema: ReleaseNoteEntry,
  },
  blog: {
    path: "src/routes/(root)/blog/posts",
    entrySchema: BlogEntry,
  },
  platform: {
    path: "src/routes/(root)/platform/(doc)",
    entrySchema: PlatformEntry,
  },
  sdk: {
    path: "src/routes/(root)/sdk",
    entrySchema: DocsEntry,
  },
} satisfies Record<string, CollectionConfig>;

export type CollectionConfig = {
  path: string;
  entrySchema: z.ZodType<unknown>;
};
