import type { Endpoint } from "../schema-utils/endpoint";
import type { Operation } from "../schema-utils/operation";
import Try from "./try/Try";

export interface EndpointPlaygroundProps {
  apiHost: string;
  schema: any;
  endpoint: Endpoint;
  operation: Operation;
}
export default function EndpointPlayground(props: EndpointPlaygroundProps) {
  return (
    <div class="top-4rem sticky flex h-[calc(100vh-10rem)] flex-col gap-1">
      <div class="text-sm font-bold uppercase">try</div>
      <Try {...props} />
    </div>
  );
}
