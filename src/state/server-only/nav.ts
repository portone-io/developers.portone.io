import { computed } from "@preact/signals";

import navYamlKo from "~/content/docs/ko/_nav.yaml";
import type { YamlNavMenuItem } from "../../type";
import { Frontmatters, frontmattersSignal } from "./frontmatters";

export interface NavMenu {
  [lang: string]: NavMenuItem[];
}
export type NavMenuItem = NavMenuPage | NavMenuGroup;
export interface NavMenuPage {
  type: "page";
  slug: string;
  frontmatter: Record<string, any>;
  items: NavMenuItem[];
}
export interface NavMenuGroup {
  type: "group";
  label: string;
  items: NavMenuItem[];
}
export const navMenuSignal = computed<NavMenu>(() => {
  const frontmatters = frontmattersSignal.value;
  return {
    "ko": toNavMenuItems(navYamlKo, frontmatters),
  };
});

function toNavMenuItems(
  yaml: YamlNavMenuItem[],
  frontmatters: Frontmatters,
): NavMenuItem[] {
  return yaml.map((item) => {
    if (typeof item === "string") {
      return {
        type: "page",
        slug: item,
        frontmatter: frontmatters[item] || {},
        items: [],
      };
    } else if ("slug" in item) {
      return {
        type: "page",
        slug: item.slug,
        frontmatter: frontmatters[item.slug] || {},
        items: toNavMenuItems(item.items, frontmatters),
      };
    } else {
      return {
        type: "group",
        label: item.label,
        items: toNavMenuItems(item.items, frontmatters),
      };
    }
  });
}
