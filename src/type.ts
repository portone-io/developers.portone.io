export type Lang = "ko" | "en";

export type YamlNavMenuToplevelItem =
  | YamlNavMenuPageSugar
  | YamlNavMenuPage
  | YamlNavMenuGroup;
export type YamlNavMenuItem =
  | YamlNavMenuPageSugar
  | YamlNavMenuPage;
type YamlNavMenuPageSugar = string;
interface YamlNavMenuPage {
  slug: string;
  items: YamlNavMenuItem[];
}
interface YamlNavMenuGroup {
  label: string;
  items: YamlNavMenuItem[];
}
