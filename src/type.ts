export type Lang = "ko" | "en";

export type SystemVersion = "all" | "v1" | "v2";

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
  side?: {
    label: string;
    link: string;
    eventname?: string;
  };
}

declare global {
  function trackEvent(event: string, props: object, cb?: Function): void;
}
