import { computed } from "@preact/signals";

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
  emoji: string;
  title: string;
  items: NavMenuPage[];
}
export interface NavMenuGroup {
  type: "group";
  label: string;
  items: NavMenuPage[];
}
export const navMenuSignal = computed<NavMenu>(() => {
  const frontmatters = frontmattersSignal.value;
  return {
    "ko": toNavMenuItems(navYamlKo, frontmatters),
  };
});

interface EmojiAndTitle {
  emoji: string;
  title: string;
}
function frontmatterToEmojiAndTitle(
  frontmatter?: Record<string, any>,
): EmojiAndTitle {
  return {
    emoji: frontmatter?.["emoji"] || "",
    title: frontmatter?.["title"] || "",
  };
}

function toNavMenuItems(
  yaml: YamlNavMenuToplevelItem[],
  frontmatters: Frontmatters,
): NavMenuItem[] {
  return yaml.map((item) => {
    if (typeof item === "string") {
      return {
        type: "page",
        slug: item,
        ...frontmatterToEmojiAndTitle(frontmatters[item]),
        items: [],
      };
    } else if ("slug" in item) {
      return {
        type: "page",
        slug: item.slug,
        ...frontmatterToEmojiAndTitle(frontmatters[item.slug]),
        items: toNavMenuItems(item.items, frontmatters) as NavMenuPage[],
      };
    } else {
      return {
        type: "group",
        label: item.label,
        items: toNavMenuItems(item.items, frontmatters) as NavMenuPage[],
      };
    }
  });
}
