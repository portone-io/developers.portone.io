import { createSignal } from "solid-js";

export const [currentSection, setCurrentSection] = createSignal("");

export interface NavOpenStates {
  [sectionId: string]: boolean; // true: open, false: close
}

export const [navOpenStates, setNavOpenStates] = createSignal<NavOpenStates>(
  {},
);

export function toggleNav(sectionId: string): void {
  if (navOpenStates()[sectionId]) closeNav(sectionId);
  else openNav(sectionId);
}

export function openNav(sectionId: string): void {
  setNavOpenStates((prev) => ({
    ...prev,
    [sectionId]: true,
  }));
}

export function closeNav(sectionId: string): void {
  setNavOpenStates((prev) => ({
    ...prev,
    [sectionId]: false,
  }));
}
