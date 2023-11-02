import { computed } from "@preact/signals";

import navYamlEn from "~/content/docs/en/_nav.yaml";
import navYamlKo from "~/content/docs/ko/_nav.yaml";
import type { SystemVersion, YamlNavMenuToplevelItem } from "~/type";
import { Frontmatters, frontmattersSignal } from "./frontmatters";

export interface NavMenu {
  [lang: string]: NavMenuItem[];
}
export type NavMenuItem = NavMenuPage | NavMenuGroup;
export interface NavMenuPage {
  type: "page";
  slug: string;
  title: string;
  items: NavMenuPage[];
  systemVersion: SystemVersion;
}
export interface NavMenuGroup {
  type: "group";
  label: string;
  items: NavMenuPage[];
  systemVersion: SystemVersion;
  side?:
    | {
        label: string;
        link: string;
        eventname?: string;
      }
    | undefined;
}
export const navMenuItemsEnSignal = computed<NavMenuItem[]>(() => {
  const frontmatters = frontmattersSignal.value;
  return toNavMenuItems(navYamlEn, frontmatters);
});
export const navMenuItemsKoSignal = computed<NavMenuItem[]>(() => {
  const frontmatters = frontmattersSignal.value;
  return toNavMenuItems(navYamlKo, frontmatters);
});
export const navMenuSignal = computed<NavMenu>(() => {
  const navMenuItemsEn = navMenuItemsEnSignal.value;
  const navMenuItemsKo = navMenuItemsKoSignal.value;
  return { en: navMenuItemsEn, ko: navMenuItemsKo };
});

export interface NavMenuSystemVersions {
  [slug: string]: SystemVersion;
}
export function calcNavMenuSystemVersions(
  navMenuItems: NavMenuItem[]
): NavMenuSystemVersions {
  const result: NavMenuSystemVersions = {};
  for (const item of iterNavMenuItems(navMenuItems)) {
    if (!("slug" in item)) continue;
    result[item.slug] = item.systemVersion;
  }
  return result;
}

export interface NavMenuAncestors {
  [slug: string]: string[];
}
export function calcNavMenuAncestors(
  navMenuItems: NavMenuItem[]
): NavMenuAncestors {
  const navMenuAncestors: NavMenuAncestors = {};
  for (const { slug, ancestors } of iterNavMenuAncestors(navMenuItems)) {
    navMenuAncestors[slug] = ancestors;
  }
  return navMenuAncestors;
}
function* iterNavMenuAncestors(
  navMenuItems: NavMenuItem[],
  ancestors: string[] = []
): Generator<{ slug: string; ancestors: string[] }> {
  for (const item of navMenuItems) {
    if (item.type === "group") {
      yield* iterNavMenuAncestors(item.items, ancestors);
    } else if (item.type === "page") {
      const { slug, items } = item;
      yield { slug, ancestors };
      yield* iterNavMenuAncestors(items, [...ancestors, slug]);
    }
  }
}

function* iterNavMenuItems(items: NavMenuItem[]): Generator<NavMenuItem> {
  for (const item of items) {
    yield item;
    if ("items" in item) yield* iterNavMenuItems(item.items);
  }
}

function toNavMenuItems(
  yaml: YamlNavMenuToplevelItem[],
  frontmatters: Frontmatters,
  systemVersion: SystemVersion = "all"
): NavMenuItem[] {
  return yaml.map((item) => {
    if (typeof item === "string") {
      return {
        type: "page",
        slug: item,
        title: frontmatters[item]?.["title"] || "",
        items: [],
        systemVersion,
      };
    } else if ("slug" in item) {
      const _systemVersion = item.systemVersion || systemVersion;
      return {
        type: "page",
        slug: item.slug,
        title: frontmatters[item.slug]?.["title"] || "",
        items: item.items
          ? (toNavMenuItems(
              item.items,
              frontmatters,
              _systemVersion
            ) as NavMenuPage[])
          : [],
        systemVersion: _systemVersion,
      };
    } else {
      const _systemVersion = item.systemVersion || systemVersion;
      return {
        type: "group",
        label: item.label,
        items: toNavMenuItems(
          item.items,
          frontmatters,
          _systemVersion
        ) as NavMenuPage[],
        systemVersion: _systemVersion,
        side: item.side,
      };
    }
  });
}
