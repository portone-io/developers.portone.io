import { effect, signal } from "@preact/signals";

export interface NavOpenStates {
  [slug: string]: boolean; // true: open, false: close
}
export const navOpenStatesSignal = signal<NavOpenStates>(
  JSON.parse(globalThis.sessionStorage?.getItem("navOpenStates") || "{}"),
);
effect(() => {
  const navOpenStates = navOpenStatesSignal.value;
  globalThis.sessionStorage?.setItem(
    "navOpenStates",
    JSON.stringify(navOpenStates),
  );
});

export const slugSignal = signal<string>("");
