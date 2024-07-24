declare module "solid-mdx" {
  import type { Component, JSXElement } from "solid-js";

  export interface MDXProviderProps {
    components: Record<string, Component>;
    children: JSXElement;
  }

  export const MDXProvider: Component<MDXProviderProps>;
}
