import { Link } from "@solidjs/meta";
import type { JSXElement } from "solid-js";

export default function BlogLayout(props: { children: JSXElement }) {
  return (
    <>
      <Link
        rel="alternate"
        type="application/rss+xml"
        title="PortOne 기술 블로그"
        href="https://developers.portone.io/blog/rss.xml"
      />
      {props.children}
    </>
  );
}
