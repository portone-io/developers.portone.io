import { z } from "astro:content";

export type Lang = "ko" | "en";

export const isLang = (lang: unknown): lang is Lang => {
  return ["ko", "en"].includes(String(lang));
};

export const SystemVersion = z.enum(["v1", "v2"]);
export type SystemVersion = z.infer<typeof SystemVersion>;

export type YamlNavMenuToplevelItem =
  | YamlNavMenuPageSugar
  | YamlNavMenuPage
  | YamlNavMenuGroup;
export type YamlNavMenuItem = YamlNavMenuPageSugar | YamlNavMenuPage;
type YamlNavMenuPageSugar = string;
interface YamlNavMenuPage {
  slug: string;
  items: YamlNavMenuItem[];
  systemVersion?: SystemVersion;
}
interface YamlNavMenuGroup {
  label: string;
  items: YamlNavMenuItem[];
  systemVersion: SystemVersion;
}

declare global {
  function trackEvent(event: string, props: object, cb?: () => void): void;
}
