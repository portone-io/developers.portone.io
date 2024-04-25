import type { APIContext } from "astro";

import {
  overrideContext,
  readContext,
  type ServerContext,
} from "~/state/server-only/context";
import type { SystemVersion } from "~/type";

import { parseSystemVersion } from "./utils";

declare module "~/state/server-only/context" {
  interface ServerContext {
    systemVersion: SystemVersion;
  }
}

export function readServerSystemVersion() {
  return readContext("systemVersion");
}

export function overrideSystemVersion(
  systemVersion: ServerContext["systemVersion"],
) {
  return overrideContext("systemVersion", systemVersion);
}

export function parseServerSystemVersion(ctx: APIContext) {
  const value = ctx.url.searchParams.get("v");
  return parseSystemVersion(value);
}

export function getInitialSystemVersion() {
  return readServerSystemVersion();
}

export const useSystemVersion = () => readServerSystemVersion();
export const updateSystemVersion = () => {};
