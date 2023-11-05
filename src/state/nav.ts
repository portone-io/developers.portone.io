import { effect, signal } from "@preact/signals";
import type { SystemVersion } from "~/type";

const isClient = Boolean(globalThis.sessionStorage);
const isServer = !isClient;

export interface NavOpenStates {
  [slug: string]: boolean; // true: open, false: close
}
export const navOpenStatesSignal = signal<NavOpenStates>(
  JSON.parse(globalThis.sessionStorage?.getItem("navOpenStates") || "{}")
);
if (isClient) {
  effect(() => {
    const navOpenStates = navOpenStatesSignal.value;
    const navOpenStatesString = JSON.stringify(navOpenStates);
    globalThis.sessionStorage.setItem("navOpenStates", navOpenStatesString);
  });
}

export const slugSignal = signal<string>("");

export const systemVersionSignal = signal(getInitialSystemVersion());
function getInitialSystemVersion() {
  if (isServer) return "all";
  const storageItem = globalThis.sessionStorage.getItem("systemVersion");
  const searchParams = new URLSearchParams(location.search);
  return (searchParams.get("v") || storageItem || "v1") as SystemVersion;
}
if (isClient) {
  effect(() => {
    const systemVersion = systemVersionSignal.value;
    globalThis.sessionStorage.setItem("systemVersion", systemVersion);
    const searchParams = new URLSearchParams(location.search);
    searchParams.set("v", systemVersion);
    history.replaceState(null, "", "?" + searchParams.toString());
  });
}
