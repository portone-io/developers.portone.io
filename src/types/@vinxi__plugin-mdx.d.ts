declare module "@vinxi/plugin-mdx" {
  import type { CompileOptions } from "@mdx-js/mdx";

  import type { Plugin } from "../../node_modules/vinxi/dist/types/lib/vite-dev";

  const exports: {
    withImports: (
      imports: Record<string, string>,
    ) => (options: CompileOptions) => Plugin;
  };

  export default { default: exports };
}
