import type { JSXElement } from "solid-js";

interface Props {
  children: JSXElement;
}

export default function SwaggerDescription(props: Props) {
  return <p>{props.children}</p>;
}
