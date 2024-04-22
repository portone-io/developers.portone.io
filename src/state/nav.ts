import { effect, signal } from "@preact/signals";
import type { AstroGlobal } from "astro";

import type { SystemVersion } from "~/type";

const isClient = Boolean(globalThis.sessionStorage);
const isServer = !isClient;

export interface NavOpenStates {
  [slug: string]: boolean; // true: open, false: close
}
export const navOpenStatesSignal = signal<NavOpenStates>(
  JSON.parse(
    globalThis.sessionStorage?.getItem("navOpenStates") || "{}",
  ) as NavOpenStates,
);
if (isClient) {
  effect(() => {
    const navOpenStates = navOpenStatesSignal.value;
    const navOpenStatesString = JSON.stringify(navOpenStates);
    globalThis.sessionStorage.setItem("navOpenStates", navOpenStatesString);
  });
}

export const slugSignal = signal<string>("");

const parseSystemVersion = (value: unknown) => {
  return ["v1", "v2"].includes(value as string)
    ? (value as SystemVersion)
    : "v1"; // default
};

export const systemVersionSignal = signal(getInitialSystemVersion());
function getInitialSystemVersion() {
  if (isServer) return "v1"; // default
  const storageItem = globalThis.sessionStorage.getItem("systemVersion");
  const searchParams = new URLSearchParams(location.search);
  return parseSystemVersion(searchParams.get("v") || storageItem);
}
export function getServerSystemVersion(astro: AstroGlobal) {
  const value = astro.url.searchParams.get("v");
  return parseSystemVersion(value);
}
if (isClient) {
  effect(() => {
    const systemVersion = systemVersionSignal.value;
    globalThis.sessionStorage.setItem("systemVersion", systemVersion);
    const searchParams = new URLSearchParams(location.search);
    searchParams.set("v", systemVersion);
    const hash = location.hash;
    history.replaceState(null, "", `?${searchParams.toString()}${hash}`);
  });
}
