import { effect, signal } from "@preact/signals";

import type { SystemVersion } from "~/type";

import { parseSystemVersion } from "./utils";

export function getInitialSystemVersion() {
  const storageItem = globalThis.sessionStorage.getItem("systemVersion");
  const searchParams = new URLSearchParams(location.search);
  return parseSystemVersion(searchParams.get("v") || storageItem);
}
export const useSystemVersion = () => systemVersionSignal.value;

const systemVersionSignal = signal(getInitialSystemVersion());
export const setSystemVersion = (systemVersion: SystemVersion) => {
  systemVersionSignal.value = systemVersion;
};

effect(() => {
  const systemVersion = systemVersionSignal.value;
  globalThis.sessionStorage.setItem("systemVersion", systemVersion);
  if (
    [/^\/docs\//, /^\/api\//].some((regex) => regex.test(location.pathname))
  ) {
    const searchParams = new URLSearchParams(location.search);
    searchParams.set("v", systemVersion);
    const hash = location.hash;
    history.replaceState(null, "", `?${searchParams.toString()}${hash}`);
  }
});