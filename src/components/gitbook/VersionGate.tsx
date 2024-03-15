import type React from "react";

import { useServerFallback } from "~/misc/useServerFallback";
import { systemVersionSignal } from "~/state/nav";

interface Props {
  default?: "v1" | "v2";
  v1?: React.ReactNode;
  v2?: React.ReactNode;
  children?: React.ReactNode;
}

const isEmptyStaticHtml = (node: React.ReactNode) => {
  if (!(node && typeof node === "object" && "props" in node)) return false;
  const props = node.props as unknown;

  return Boolean(
    props &&
      typeof props === "object" &&
      "value" in props &&
      !JSON.parse(JSON.stringify(props.value)),
  );
};

export default function VersionGate(props: Props) {
  const systemVersion = useServerFallback(systemVersionSignal.value, "all");

  const hasV1 = !isEmptyStaticHtml(props.v1);
  const hasV2 = !isEmptyStaticHtml(props.v2);
  const v1 = hasV1 ? props.v1 : null;
  const v2 = hasV2 ? props.v2 : null;
  const v1Content = props.default === "v1" ? v1 ?? props.children : v1;
  const v2Content = props.default === "v2" ? v2 ?? props.children : v2;

  return (
    <>
      {systemVersion !== "v1" && v2Content}
      {systemVersion !== "v2" && v1Content}
    </>
  );
}
