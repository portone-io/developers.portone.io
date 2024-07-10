import { z } from "zod";

export const Lang = z.enum(["ko", "en"]);
export type Lang = z.infer<typeof Lang>;

export const isLang = (v: unknown) => Lang.safeParse(v).success;

export const SystemVersion = z.enum(["v1", "v2"]);
export type SystemVersion = z.infer<typeof SystemVersion>;

export type YamlNavMenuToplevelItem =
  | YamlNavMenuPageSugar
  | YamlNavMenuPage
  | YamlNavMenuExternalPage
  | YamlNavMenuGroup;
export type YamlNavMenuItem =
  | YamlNavMenuPageSugar
  | YamlNavMenuPage
  | YamlNavMenuExternalPage;
type YamlNavMenuPageSugar = string;
interface YamlNavMenuPage {
  slug: string;
  items: YamlNavMenuItem[];
  systemVersion?: SystemVersion;
}
interface YamlNavMenuExternalPage {
  label: string;
  href: string;
  items?: YamlNavMenuItem[];
  systemVersion?: SystemVersion;
}
interface YamlNavMenuGroup {
  label: string;
  items: YamlNavMenuItem[];
  systemVersion: SystemVersion;
}
