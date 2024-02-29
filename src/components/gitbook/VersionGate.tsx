import type React from "react";

import { useServerFallback } from "~/misc/useServerFallback";
import { systemVersionSignal } from "~/state/nav";

interface Props {
  default: "v1" | "v2";
  v1?: React.ReactNode;
  v2?: React.ReactNode;
  children?: React.ReactNode;
}

export default function VersionGate(props: Props) {
  const systemVersion = useServerFallback(systemVersionSignal.value, "all");

  const v1Content =
    props.default === "v1" ? props.v1 ?? props.children : props.v1;
  const v2Content =
    props.default === "v2" ? props.v2 ?? props.children : props.v2;

  return (
    <>
      {systemVersion !== "v1" && v2Content}
      {systemVersion !== "v2" && v1Content}
    </>
  );
}
