/* @jsxImportSource solid-js */

import { clsx } from "clsx";
import type { JSX } from "solid-js";

export interface GnbLinkProps {
  slug: string;
  active: boolean;
  children?: JSX.Element;
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
      onClick={() =>
        trackEvent("Developers_Platform_Gnb_Click", { slug: props.slug })
      }
    >
      {props.children}
    </a>
  );
}
export default GnbLink;
