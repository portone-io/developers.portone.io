import { effect, signal } from "@preact/signals";

const isClient = Boolean(globalThis.sessionStorage);

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
