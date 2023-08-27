import * as prose from "~/components/prose";
import TwoColumnLayout from "./TwoColumnLayout";
import type { Endpoint } from "./schema-utils/endpoint";
import { getOperation } from "./schema-utils/operation";

export interface EndpointDocProps {
  schema: any;
  endpoint: Endpoint;
}
export default function EndpointDoc({ schema, endpoint }: EndpointDocProps) {
  const operation = getOperation(schema, endpoint);
  return (
    <div class="flex flex-col">
      <prose.h3>
        <div class="text-slate-5 flex items-end gap-1 rounded font-mono text-sm">
          <span class="text-base font-bold uppercase">{endpoint.method}</span>
          <span>{endpoint.path}</span>
        </div>
        <div>{endpoint.title}</div>
      </prose.h3>
      <TwoColumnLayout
        left={
          <>
            {operation.description && (
              <article
                class="bg-slate-1 rounded p-2 text-sm"
                dangerouslySetInnerHTML={{
                  __html: operation.description,
                }}
              />
            )}
            <TwoColumnLayout
              className="mt-2"
              left={
                <>
                  <h4 class="text-xs font-bold uppercase">Path</h4>
                  <h4 class="text-xs font-bold uppercase">Query</h4>
                  <h4 class="text-xs font-bold uppercase">Body</h4>
                </>
              }
              right={
                <>
                  <h4 class="text-xs font-bold uppercase">200</h4>
                  <h4 class="text-xs font-bold uppercase">400</h4>
                  <h4 class="text-xs font-bold uppercase">500</h4>
                </>
              }
              bp="md"
              gap={2}
            />
          </>
        }
        right={null}
      />
    </div>
  );
}
