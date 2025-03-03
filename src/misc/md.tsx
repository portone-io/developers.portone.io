import { evaluateSync } from "@mdx-js/mdx";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";
import remarkParse from "remark-parse";
import { createComponent, type ParentProps } from "solid-js";
import { useMDXComponents } from "solid-mdx";

const Fragment = (props: ParentProps) => {
  return props.children;
};

export function toMDXModule(md: string) {
  return evaluateSync(md, {
    format: "md",
    Fragment: Fragment,
    jsx: createComponent,
    jsxDEV: createComponent,
    jsxs: createComponent,
    remarkPlugins: [remarkParse, remarkGfm, remarkHtml],
    useMDXComponents,
  }).default;
}
