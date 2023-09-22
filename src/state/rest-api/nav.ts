import { signal } from "@preact/signals";

export const currentSectionSignal = signal<string>("");

export interface NavOpenStates {
  [sectionId: string]: boolean; // true: open, false: close
}

export const navOpenStatesSignal = signal<NavOpenStates>({});

export function toggleNav(sectionId: string): void {
  if (navOpenStatesSignal.value[sectionId]) closeNav(sectionId);
  else openNav(sectionId);
}

export function openNav(sectionId: string): void {
  navOpenStatesSignal.value = {
    ...navOpenStatesSignal.peek(),
    [sectionId]: true,
  };
}

export function closeNav(sectionId: string): void {
  navOpenStatesSignal.value = {
    ...navOpenStatesSignal.peek(),
    [sectionId]: false,
  };
}
