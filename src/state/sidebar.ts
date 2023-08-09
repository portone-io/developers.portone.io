import { effect, signal } from "@preact/signals";
import type { SystemVersion } from "~/type";

const isServer = !globalThis.sessionStorage;

export const sidebarOpenSignal = signal(false);
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
