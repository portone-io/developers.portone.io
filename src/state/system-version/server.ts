import { AsyncLocalStorage } from "node:async_hooks";

import { Signal, signal } from "@preact/signals";
import type { APIContext } from "astro";

import type { SystemVersion } from "~/type";

import { parseSystemVersion } from "./utils";

const systemVersionStorage = new AsyncLocalStorage<Signal<SystemVersion>>();
export function useServerSystemVersion() {
  const value = systemVersionStorage.getStore()?.value;
  if (!value) {
    throw new Error("Failed to get system version");
  }
  return value;
}
export function withSystemVersion<T>(
  systemVersion: SystemVersion,
  fn: () => Promise<T>,
) {
  return systemVersionStorage.run(signal(systemVersion), fn);
}
export function overrideSystemVersion(systemVersion: SystemVersion) {
  const signal = systemVersionStorage.getStore();
  if (!signal) {
    throw new Error("No system version to override");
  }
  signal.value = systemVersion;
}
export function parseServerSystemVersion(ctx: APIContext) {
  const value = ctx.url.searchParams.get("v");
  return parseSystemVersion(value);
}

export function getInitialSystemVersion() {
  return useServerSystemVersion();
}

export const useSystemVersion = () => useServerSystemVersion();
