import type { CollectionEntry } from "astro:content";

import { overrideContext, readContext, type ServerContext } from "./context";

declare module "~/state/server-only/context" {
  interface ServerContext {
    docData: CollectionEntry<"docs">["data"] | null;
  }
}

export function readDocData() {
  return readContext("docData");
}

export function overrideDocData(docData: ServerContext["docData"]) {
  return overrideContext("docData", docData);
}
