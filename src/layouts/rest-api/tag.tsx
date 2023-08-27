import { useSignal } from "@preact/signals";
import * as prose from "~/components/prose";
import {
  groupEndpointsByTag,
  type Endpoint,
  getEveryEndpoints,
} from "./schema-utils/endpoint";
import TwoColumnLayout from "./TwoColumnLayout";
import Expand from "./Expand";
import { Hr, interleave } from ".";
import EndpointDoc from "./EndpointDoc";

export interface TagsProps {
  schema: any;
}
export function Tags({ schema }: TagsProps) {
  const everyEndpoints = getEveryEndpoints(schema);
  return (
    <>
      {interleave(
        groupEndpointsByTag(schema, everyEndpoints).map(
          ({ tag, endpoints }) => (
            <Tag
              schema={schema}
              title={tag.name}
              summary={tag.description}
              endpoints={endpoints}
            />
          )
        ),
        <Hr />
      )}
    </>
  );
}

export interface TagProps {
  schema: any;
  title: string;
  summary: any;
  description?: any;
  endpoints: Endpoint[];
}
export function Tag({ schema, title, summary, endpoints }: TagProps) {
  // const expandSignal = useSignal(false);
  const expandSignal = useSignal(true);
  return (
    <div class="flex flex-col">
      <div>
        <prose.h2>{title}</prose.h2>
      </div>
      <TwoColumnLayout
        left={<div class="mt-4">{summary}</div>}
        right={
          <ul class="border-slate-3 bg-slate-1 flex flex-col gap-4 rounded-lg border p-4">
            {endpoints.map(({ method, path, title }, i) => (
              <li key={i} class="flex flex-col text-sm leading-tight">
                <div class="text-slate-6 font-bold">{title}</div>
                <div class="text-slate-4 ml-2 flex gap-2 font-mono">
                  <span class="font-bold">{method}</span>
                  <span>{path}</span>
                </div>
              </li>
            ))}
          </ul>
        }
      />
      <Expand
        className="mt-10"
        expand={expandSignal.value}
        onExpand={(v) => (expandSignal.value = v)}
      >
        {endpoints.map((endpoint) => (
          <EndpointDoc schema={schema} endpoint={endpoint} />
        ))}
      </Expand>
    </div>
  );
}
