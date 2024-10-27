import { type JSXElement } from "solid-js";

import { Docs, route as docsRoute } from "~/layouts/docs/index";

export const route = docsRoute;

export default function Sdk(props: { children: JSXElement }) {
  return <Docs>{props.children}</Docs>;
}
