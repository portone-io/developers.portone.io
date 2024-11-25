import { type JSXElement } from "solid-js";

import { Docs, preload } from "~/layouts/docs/index";

export const route = {
  preload,
};

export default function Sdk(props: { children: JSXElement }) {
  return <Docs>{props.children}</Docs>;
}
