/* @jsxImportSource solid-js */

import type { Operation } from "../../schema-utils";
import type { Endpoint } from "../../schema-utils/endpoint";
import Try from "./try/Try.solid";

export interface EndpointPlaygroundProps {
  apiHost: string;
  endpoint: Endpoint;
  operation: Operation;
}
export default function EndpointPlayground(props: EndpointPlaygroundProps) {
  return (
    <div class="text-14px top-4rem sticky flex h-[calc(100vh-10rem)] flex-col gap-1 rounded-lg">
      <div class="text-sm font-bold uppercase">try</div>
      <Try {...props} />
    </div>
  );
}
