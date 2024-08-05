import clsx from "clsx";
import type { JSXElement } from "solid-js";

export interface GnbLinkProps {
  slug: string;
  active: boolean;
  children?: JSXElement;
}
function GnbLink(props: GnbLinkProps) {
  return (
    <a
      href={`/platform/${props.slug}`}
      class={clsx(
        "flex h-full items-center",
        props.active &&
          "border-b-orange-6 border-b-2 border-t-2 border-t-transparent font-bold",
      )}
    >
      {props.children}
    </a>
  );
}
export default GnbLink;
