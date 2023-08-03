import { computed } from "@preact/signals";

import navYamlEn from "~/content/docs/en/_nav.yaml";
import navYamlKo from "~/content/docs/ko/_nav.yaml";
import type { YamlNavMenuToplevelItem } from "~/type";
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
}
export interface NavMenuGroup {
  type: "group";
  label: string;
  items: NavMenuPage[];
  side?:
    | {
        label: string;
        link: string;
      }
    | undefined;
}
export const navMenuSignal = computed<NavMenu>(() => {
  const frontmatters = frontmattersSignal.value;
  return {
    en: toNavMenuItems(navYamlEn, frontmatters),
    ko: toNavMenuItems(navYamlKo, frontmatters),
  };
});

export interface NavMenuAncestors {
  [slug: string]: string[];
}
export const navMenuAncestorsSignal = computed<NavMenuAncestors>(() => {
  const navMenu = navMenuSignal.value;
  const navMenuAncestors: NavMenuAncestors = {};
  for (const items of Object.values(navMenu)) {
    for (const { slug, ancestors } of iterNavMenuAncestors(items)) {
      navMenuAncestors[slug] = ancestors;
    }
  }
  return navMenuAncestors;
});
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

function toNavMenuItems(
  yaml: YamlNavMenuToplevelItem[],
  frontmatters: Frontmatters
): NavMenuItem[] {
  return yaml.map((item) => {
    if (typeof item === "string") {
      return {
        type: "page",
        slug: item,
        title: frontmatters[item]?.["title"] || "",
        items: [],
      };
    } else if ("slug" in item) {
      return {
        type: "page",
        slug: item.slug,
        title: frontmatters[item.slug]?.["title"] || "",
        items: toNavMenuItems(item.items, frontmatters) as NavMenuPage[],
      };
    } else {
      return {
        type: "group",
        label: item.label,
        items: toNavMenuItems(item.items, frontmatters) as NavMenuPage[],
        side: item.side,
      };
    }
  });
}
