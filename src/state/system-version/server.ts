import { AsyncLocalStorage } from "node:async_hooks";

import type { APIContext } from "astro";

import type { SystemVersion } from "~/type";

import { parseSystemVersion } from "./utils";

const systemVersionStorage = new AsyncLocalStorage<SystemVersion>();
export function useServerSystemVersion() {
  const value = systemVersionStorage.getStore();
  if (!value) {
    throw new Error("Failed to get system version");
  }
  return value;
}
export function withSystemVersion<T>(
  systemVersion: SystemVersion,
  fn: () => Promise<T>,
) {
  return systemVersionStorage.run(systemVersion, fn);
}
export function parseServerSystemVersion(ctx: APIContext) {
  const value = ctx.url.searchParams.get("v");
  return parseSystemVersion(value);
}

export function getInitialSystemVersion() {
  return useServerSystemVersion();
}

export const useSystemVersion = () => useServerSystemVersion();
