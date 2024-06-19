import type { SystemVersion } from "~/type";

export interface NavMenu {
  [lang: string]: NavMenuItem[];
}

export type NavMenuItem = NavMenuPage | NavMenuGroup;

export interface NavMenuPage {
  type: "page";
  path: string;
  title: string;
  items: NavMenuPage[];
  systemVersion?: SystemVersion | undefined;
}

export interface NavMenuGroup {
  type: "group";
  label: string;
  items: NavMenuPage[];
  systemVersion?: SystemVersion | undefined;
}

export interface NavMenuSystemVersions {
  [path: string]: SystemVersion;
}
export function calcNavMenuSystemVersions(
  navMenuItems: NavMenuItem[],
): NavMenuSystemVersions {
  const result: NavMenuSystemVersions = {};
  for (const item of iterNavMenuItems(navMenuItems)) {
    if (!("path" in item)) continue;
    if (item.systemVersion) result[item.path] = item.systemVersion;
  }
  return result;
}

function* iterNavMenuItems(items: NavMenuItem[]): Generator<NavMenuItem> {
  for (const item of items) {
    yield item;
    if ("items" in item) yield* iterNavMenuItems(item.items);
  }
}

export interface NavMenuAncestors {
  [slug: string]: string[];
}

export function calcNavMenuAncestors(
  navMenuItems: NavMenuItem[],
): NavMenuAncestors {
  const navMenuAncestors: NavMenuAncestors = {};
  for (const { slug, ancestors } of iterNavMenuAncestors(navMenuItems)) {
    if (navMenuAncestors[slug]) navMenuAncestors[slug]!.push(...ancestors);
    else navMenuAncestors[slug] = ancestors;
  }
  return navMenuAncestors;
}

function* iterNavMenuAncestors(
  navMenuItems: NavMenuItem[],
  ancestors: string[] = [],
): Generator<{ slug: string; ancestors: string[] }> {
  for (const item of navMenuItems) {
    if (item.type === "group") {
      yield* iterNavMenuAncestors(item.items, ancestors);
    } else if (item.type === "page") {
      const { path: slug, items } = item;
      yield { slug, ancestors };
      yield* iterNavMenuAncestors(items, [...ancestors, slug]);
    }
  }
}
