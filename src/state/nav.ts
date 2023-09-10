import { effect, signal } from "@preact/signals";
import type { SystemVersion } from "~/type";

const isServer = !globalThis.sessionStorage;

export interface NavOpenStates {
  [slug: string]: boolean; // true: open, false: close
}
export const navOpenStatesSignal = signal<NavOpenStates>(
  JSON.parse(globalThis.sessionStorage?.getItem("navOpenStates") || "{}")
);
effect(() => {
  const navOpenStates = navOpenStatesSignal.value;
  globalThis.sessionStorage?.setItem(
    "navOpenStates",
    JSON.stringify(navOpenStates)
  );
});

export const slugSignal = signal<string>("");

export const systemVersionSignal = signal(
  isServer
    ? "all"
    : (globalThis.sessionStorage.getItem("systemVersion") as SystemVersion) ||
        "v1"
);

effect(() => {
  const systemVersion = systemVersionSignal.value;
  globalThis.sessionStorage?.setItem("systemVersion", systemVersion);
});
