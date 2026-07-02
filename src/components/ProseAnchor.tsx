import { A } from "@solidjs/router";
import { createMemo, type JSX, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

export default function ProseAnchor(props: JSX.IntrinsicElements["a"]) {
  const [local, others] = splitProps(props, ["children", "href"]);

  const isExternalLink = createMemo(() => {
    if (!local.href) return false;
    return /^(mailto|tel):/i.test(local.href);
  });

  const component = createMemo(() => (isExternalLink() ? "a" : A));

  return (
    <Dynamic component={component()} {...others} href={local.href ?? "#"}>
      {local.children}
    </Dynamic>
  );
}
