import * as React from "react";
import * as prose from "~/components/prose";
import { doublePushAndBack } from "~/misc/history";
import { wait } from "~/misc/async";
import { expandTag, expanded, useExpand } from "~/state/rest-api/tag-expand";
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
              initialExpand={group === tag.name}
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
  initialExpand: boolean;
  group: string;
  schema: any;
  title: string;
  summary: any;
  description?: any;
  endpoints: Endpoint[];
}
export function Tag({
  basepath,
  initialExpand,
  group,
  schema,
  title,
  summary,
  endpoints,
}: TagProps) {
  React.useEffect(expanded);
  const { expand, onToggle } = useExpand(group, initialExpand);
  const headingRef = React.useRef<HTMLHeadingElement>(null);
  return (
    <div class="flex flex-col">
      <div>
        <prose.h2 id={group} ref={headingRef}>
          {title}
        </prose.h2>
      </div>
      <TwoColumnLayout
        left={<div class="mt-4">{summary}</div>}
        right={
          <div class="border-slate-3 bg-slate-1 flex flex-col gap-4 rounded-lg border p-4">
            {endpoints.map((endpoint) => {
              const { method, path, title, deprecated, unstable } = endpoint;
              const repr = getEndpointRepr(endpoint);
              const href = `${basepath}/${group}#${encodeURIComponent(repr)}`;
              return (
                <a
                  key={repr}
                  href={href}
                  class={`hover:text-orange-5 text-slate-6 flex flex-col text-sm leading-tight underline-offset-4 transition-colors hover:underline ${
                    deprecated || unstable ? "opacity-50" : ""
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    expandTag(group, true, async () => {
                      doublePushAndBack(href);
                      // doublePushAndBack이 불리는 순간 스크롤이 방해받음
                      // doublePushAndBack이 끝나는 시점을 특정하는 것도 불가
                      await wait(100);
                      document
                        .getElementById(repr)
                        ?.scrollIntoView({ behavior: "smooth" });
                    });
                  }}
                  data-norefresh
                >
                  <div class="font-bold">{title}</div>
                  <div class="ml-2 flex font-mono opacity-60">
                    <span class="shrink-0 font-bold uppercase">
                      {method}&nbsp;
                    </span>
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
        expand={expand}
        onToggle={onToggle}
        onCollapse={() => {
          headingRef.current?.scrollIntoView({ behavior: "smooth" });
        }}
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
