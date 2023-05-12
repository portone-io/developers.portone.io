import { useRef } from "react";
import { useComputed } from "@preact/signals";
import FeatureSet from "../_state/featureSet";

type Props = {
  version: "v1" | "v2" | null;
  children?: React.ReactNode;
  fallback?: React.ReactNode;
};

const ServiceVersionGate: React.FC<Props> = ({
  version,
  children,
  fallback,
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);

  const matchesVersion = useComputed(
    () => FeatureSet.serviceVersion.value === version
  );

  return (
    <div ref={wrapperRef}>
      <div data-children hidden={!matchesVersion.value}>
        {children}
      </div>
      <div data-fallback hidden={matchesVersion.value}>
        {fallback}
      </div>
    </div>
  );
};

export default ServiceVersionGate;
