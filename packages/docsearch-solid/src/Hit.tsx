import type { JSXElement } from "solid-js";

import type { InternalDocSearchHit, StoredDocSearchHit } from "./types";

interface HitProps {
  hit: InternalDocSearchHit | StoredDocSearchHit;
  children: JSXElement;
}

export function Hit(props: HitProps) {
  return <a href={props.hit.url}>{props.children}</a>;
}
