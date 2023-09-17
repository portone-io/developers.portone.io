import { useSignal } from "@preact/signals";
import * as prose from "~/components/prose";
import {
  type Endpoint,
  groupEndpointsByTag,
  getEveryEndpoints,
  getEndpointRepr,
} from "./schema-utils/endpoint";
import TwoColumnLayout from "./TwoColumnLayout";
import Expand from "./Expand";
import { Hr, interleave } from ".";
import EndpointDoc from "./EndpointDoc";

export interface TagsProps {
  basepath: string; // e.g. "/api/rest-v1"
  group: string;
  schema: any;
}
export function Tags({ schema, basepath, group }: TagsProps) {
  const everyEndpoints = getEveryEndpoints(schema);
  return (
    <>
      {interleave(
        groupEndpointsByTag(schema, everyEndpoints).map(
          ({ tag, endpoints }) => (
            <Tag
              basepath={basepath}
              group={tag.name}
              expand={group === tag.name}
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
  basepath: string;
  expand: boolean;
  group: string;
  schema: any;
  title: string;
  summary: any;
  description?: any;
  endpoints: Endpoint[];
}
export function Tag({
  basepath,
  expand,
  group,
  schema,
  title,
  summary,
  endpoints,
}: TagProps) {
  const expandSignal = useSignal(expand);
  return (
    <div class="flex flex-col">
      <div>
        <prose.h2>{title}</prose.h2>
      </div>
      <TwoColumnLayout
        left={<div class="mt-4">{summary}</div>}
        right={
          <div class="border-slate-3 bg-slate-1 flex flex-col gap-4 rounded-lg border p-4">
            {endpoints.map((endpoint) => {
              const { method, path, title, deprecated, unstable } = endpoint;
              const repr = getEndpointRepr(endpoint);
              return (
                <a
                  key={repr}
                  href={`${basepath}/${group}#${encodeURIComponent(repr)}`}
                  class={`hover:text-orange-5 text-slate-6 flex flex-col text-sm leading-tight underline-offset-4 transition-colors hover:underline ${
                    deprecated || unstable ? "opacity-50" : ""
                  }`}
                >
                  <div class="font-bold">{title}</div>
                  <div class="ml-2 flex font-mono opacity-60">
                    <span class="font-bold uppercase">{method}&nbsp;</span>
                    <span>{path}</span>
                  </div>
                </a>
              );
            })}
          </div>
        }
      />
      <Expand
        className="mt-10"
        expand={expandSignal.value}
        onExpand={(v) => (expandSignal.value = v)}
      >
        {endpoints.map((endpoint) => (
          <EndpointDoc
            basepath={basepath}
            schema={schema}
            endpoint={endpoint}
            renderRightFn={({ operation }) => (
              <div>
                <a
                  target="_blank"
                  class="text-slate-5 hover:text-orange-5 font-bold underline-offset-4 transition-colors hover:underline"
                  href={`https://api.iamport.kr/#!/${group}/${operation.operationId}`}
                >
                  Swagger Test Link
                </a>
              </div>
            )}
          />
        ))}
      </Expand>
    </div>
  );
}
