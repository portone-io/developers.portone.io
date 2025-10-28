import { z } from "zod";

import { Flags } from "./types/__generated__/flags";

export const Lang = z.enum(["ko"]);
export type Lang = z.infer<typeof Lang>;

export const isLang = (v: unknown) => Lang.safeParse(v).success;

export const SystemVersion = z.enum(["v1", "v2"]);
export type SystemVersion = z.infer<typeof SystemVersion>;

export const PaymentGateway = Flags.extract([
  "nice",
  "smartro",
  "toss",
  "kpn",
  "inicis",
  "ksnet",
  "kcp",
  "kakao",
  "naver",
  "tosspay",
  "hyphen",
  "eximbay",
  "toss_brandpay",
  "welcome",
  "inicis_jp",
  "payletter_global",
]);
export type PaymentGateway = z.infer<typeof PaymentGateway>;

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
