import { createSignal, createEffect } from "solid-js";
import type { SystemVersion } from "~/type";

const isClient = Boolean(globalThis.sessionStorage);
const isServer = !isClient;

export interface NavOpenStates {
  [slug: string]: boolean; // true: open, false: close
}
export const [navOpenStates, setNavOpenStates] = createSignal<NavOpenStates>(
  JSON.parse(globalThis.sessionStorage?.getItem("navOpenStates") || "{}"),
);
if (isClient) {
  createEffect(() => {
    const navOpenStatesString = JSON.stringify(navOpenStates());
    globalThis.sessionStorage.setItem("navOpenStates", navOpenStatesString);
  });
}

export const [slug, setSlug] = createSignal<string>("");

export const [systemVersion, setSystemVersion] = createSignal(
  getInitialSystemVersion(),
);
function getInitialSystemVersion() {
  if (isServer) return "all";
  const storageItem = globalThis.sessionStorage.getItem("systemVersion");
  const searchParams = new URLSearchParams(location.search);
  return (searchParams.get("v") || storageItem || "v1") as SystemVersion;
}
if (isClient) {
  createEffect(() => {
    globalThis.sessionStorage.setItem("systemVersion", systemVersion());
    const searchParams = new URLSearchParams(location.search);
    searchParams.set("v", systemVersion());
    const hash = location.hash;
    history.replaceState(null, "", `?${searchParams.toString()}${hash}`);
  });
}
