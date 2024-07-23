import { Link } from "@solidjs/meta";

export default function BlogLayout(props: { children: JSX.Element }) {
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
