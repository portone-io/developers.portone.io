import { type JSXElement } from "solid-js";

import { Docs } from "~/layouts/docs/index";

export default function Sdk(props: { children: JSXElement }) {
  return <Docs>{props.children}</Docs>;
}
