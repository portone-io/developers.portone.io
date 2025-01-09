import "#server-only";

import * as path from "node:path";

import { opi, platform, sdk } from "#content";
import type { DocsContentName } from "~/misc/docs";
import navYamlOpiKo from "~/routes/(root)/opi/ko/_nav.yaml";
import navYamlPlatformKo from "~/routes/(root)/platform/ko/_nav.yaml";
import navYamlSdkKo from "~/routes/(root)/sdk/ko/_nav.yaml";
import type { NavMenuItem, NavMenuPage } from "~/state/nav";
import type { Lang, SystemVersion, YamlNavMenuToplevelItem } from "~/type";

type Frontmatter = {
  title?: string;
};
type Frontmatters = Record<string, Frontmatter>;

const getFrontmatters = (
  contents: Record<string, { slug: string; frontmatter: Frontmatter }>,
): Frontmatters =>
  Object.values(contents)
    .map((entry) => {
      const absSlug = path.posix.join("/", entry.slug);
      const frontmatter = entry.frontmatter || {};
      return { absSlug, frontmatter };
    })
    .reduce((acc, { absSlug, frontmatter }) => {
      acc[absSlug] = frontmatter;
      return acc;
    }, {} as Frontmatters);

const opiFrontmatters = getFrontmatters(opi);
const sdkFrontmatters = getFrontmatters(sdk);
const platformFrontmatters = getFrontmatters(platform);

const navMenuItemsOpiKo = toNavMenuItems(
  "opi",
  navYamlOpiKo as YamlNavMenuToplevelItem[],
  opiFrontmatters,
);
const navMenuItemsSdkKo = toNavMenuItems(
  "sdk",
  navYamlSdkKo as YamlNavMenuToplevelItem[],
  sdkFrontmatters,
);
const navMenuItemsPlatformKo = toNavMenuItems(
  "platform",
  navYamlPlatformKo as YamlNavMenuToplevelItem[],
  platformFrontmatters,
);
export const navMenu = {
  ko: {
    opi: navMenuItemsOpiKo,
    sdk: navMenuItemsSdkKo,
    platform: navMenuItemsPlatformKo,
  },
} as const satisfies Record<Lang, Record<DocsContentName, NavMenuItem[]>>;

function toNavMenuItems(
  baseDir: string,
  yaml: YamlNavMenuToplevelItem[],
  frontmatters: Frontmatters,
  systemVersion?: SystemVersion,
): NavMenuItem[] {
  return yaml.map((item) => {
    if (typeof item === "string") {
      return {
        type: "page",
        path: `/${baseDir}${item}`,
        title: frontmatters[item]?.["title"] || "",
        items: [],
        systemVersion,
      };
    } else if ("slug" in item) {
      const _systemVersion = item.systemVersion || systemVersion;
      return {
        type: "page",
        path: `/${baseDir}${item.slug}`,
        title: frontmatters[item.slug]?.["title"] || "",
        items: item.items
          ? (toNavMenuItems(
              baseDir,
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
        path: `/${baseDir}${item.href}`,
        title: item.label,
        items: item.items
          ? (toNavMenuItems(
              baseDir,
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
          baseDir,
          item.items,
          frontmatters,
          _systemVersion,
        ) as NavMenuPage[],
        systemVersion: _systemVersion,
      };
    }
  });
}
