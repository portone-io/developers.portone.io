import "#server-only";

import * as path from "node:path";

import { opi } from "#content";
import navYamlEn from "~/routes/(root)/docs/en/_nav.yaml";
import navYamlKo from "~/routes/(root)/opi/ko/_nav.yaml";
import type { NavMenuItem, NavMenuPage } from "~/state/nav";
import type { SystemVersion, YamlNavMenuToplevelItem } from "~/type";

type Frontmatter = {
  title?: string;
};
type Frontmatters = Record<string, Frontmatter>;

const frontmatters: Frontmatters = Object.values(opi)
  .map((entry) => {
    const absSlug = path.posix.join("/", entry.slug);
    const frontmatter = entry.frontmatter || {};
    return { absSlug, frontmatter };
  })
  .reduce((acc, { absSlug, frontmatter }) => {
    acc[absSlug] = frontmatter;
    return acc;
  }, {} as Frontmatters);

export const navMenuItemsEn = toNavMenuItems(
  navYamlEn as YamlNavMenuToplevelItem[],
  frontmatters,
);
export const navMenuItemsKo = toNavMenuItems(
  navYamlKo as YamlNavMenuToplevelItem[],
  frontmatters,
);
export const navMenu = { en: navMenuItemsEn, ko: navMenuItemsKo };

function toNavMenuItems(
  yaml: YamlNavMenuToplevelItem[],
  frontmatters: Frontmatters,
  systemVersion?: SystemVersion,
): NavMenuItem[] {
  return yaml.map((item) => {
    if (typeof item === "string") {
      return {
        type: "page",
        path: item,
        title: frontmatters[item]?.["title"] || "",
        items: [],
        systemVersion,
      };
    } else if ("slug" in item) {
      const _systemVersion = item.systemVersion || systemVersion;
      return {
        type: "page",
        path: item.slug,
        title: frontmatters[item.slug]?.["title"] || "",
        items: item.items
          ? (toNavMenuItems(
              item.items,
              frontmatters,
              _systemVersion,
            ) as NavMenuPage[])
          : [],
        systemVersion: _systemVersion,
      };
    } else if ("href" in item) {
      const _systemVersion = item.systemVersion || systemVersion;
      return {
        type: "page",
        path: item.href,
        title: item.label,
        items: item.items
          ? (toNavMenuItems(
              item.items,
              frontmatters,
              _systemVersion,
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
          _systemVersion,
        ) as NavMenuPage[],
        systemVersion: _systemVersion,
      };
    }
  });
}
