/* @jsxImportSource solid-js */

import { type JSX } from "solid-js";
import { isServer } from "solid-js/web";
import { setSchema } from "~/state/rest-api/schema";

interface Props {
  children: JSX.Element;
}

export default function SchemaHydrator(props: Props) {
  const div = (<div class="hidden">{props.children}</div>) as HTMLDivElement;
  if (!isServer) {
    const script = div.querySelector(
      'script[type="application/json"]',
    ) as HTMLScriptElement;
    if (script) {
      setSchema(JSON.parse(script.innerText));
    }
  }
  return div;
}
