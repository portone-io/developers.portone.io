import { type JSXElement, Show } from "solid-js";

import { useSystemVersion } from "~/state/system-version";

interface Props {
  v: "v1" | "v2";
  children?: JSXElement;
}

export default function VersionGate(props: Props) {
  const { systemVersion } = useSystemVersion();

  return <Show when={systemVersion() === props.v}>{props.children}</Show>;
}
