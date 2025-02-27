import type { Endpoint } from "../../schema-utils/endpoint";
import type { Operation } from "../../schema-utils/operation";
import Try from "./try/Try";

export interface EndpointPlaygroundProps {
  apiHost: string;
  schema: unknown;
  endpoint: Endpoint;
  operation: Operation;
}
export default function EndpointPlayground(props: EndpointPlaygroundProps) {
  return (
    <div class="sticky top-7rem h-[calc(100dvh-7rem)] flex flex-col gap-1 rounded-lg text-14px">
      <div class="text-sm font-bold uppercase">try</div>
      <Try {...props} />
    </div>
  );
}
