import { query } from "@solidjs/router";

import type { InteractiveDocsInit } from "~/state/interactive-docs";

import type { DocsContentName } from "./docs";

export const getInteractiveDocs = query(
  async (contentName: DocsContentName, fullSlug: string) => {
    "use server";

    const entryMap = import.meta.glob("~/routes/**/_preview/index.ts", {
      import: "preload",
    });

    const entry = Object.entries(entryMap).find(([path]) =>
      path.includes(`${contentName}/${fullSlug}`),
    );
    if (!entry) return;
    const [, importEntry] = entry;
    const interactiveDocs = (await importEntry()) as InteractiveDocsInit;
    return interactiveDocs;
  },
  "interactive-docs",
);
