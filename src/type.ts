export type Lang = "ko" | "en";

export type YamlNavMenuItem =
  | YamlNavMenuPageSugar
  | YamlNavMenuPage
  | YamlNavMenuGroup;
type YamlNavMenuPageSugar = string;
interface YamlNavMenuPage {
  slug: string;
  items: YamlNavMenuItem[];
}
interface YamlNavMenuGroup {
  label: string;
  items: YamlNavMenuItem[];
}
