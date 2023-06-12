declare module "*/_nav.yaml" {
  import type { YamlNavMenuItem } from "./type";
  const value: YamlNavMenuItem[];
  export default value;
}

declare module "*/_redir.yaml" {
  interface Redir {
    old: string;
    new: string;
  }
  const value: Redir[];
  export default value;
}
