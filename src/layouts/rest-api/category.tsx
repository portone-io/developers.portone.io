import * as React from "react";
import * as prose from "~/components/prose";
import {
  expandAndScrollTo,
  expanded,
  useExpand,
} from "~/state/rest-api/expand-section";
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

export interface CategoriesProps {
  basepath: string; // e.g. "/api/rest-v1"
  currentSection: string;
  schema: any;
}
export function Categories({
  schema,
  basepath,
  currentSection,
}: CategoriesProps) {
  const everyEndpoints = getEveryEndpoints(schema);
  return (
    <>
      {interleave(
        groupEndpointsByTag(schema, everyEndpoints).map(
          ({ tag, endpoints }) => (
            <Category
              basepath={basepath}
              section={tag.name}
              initialExpand={currentSection === tag.name}
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

export interface CategoryProps {
  basepath: string;
  initialExpand: boolean;
  section: string;
  schema: any;
  title: string;
  summary: any;
  description?: any;
  endpoints: Endpoint[];
}
export function Category({
  basepath,
  initialExpand,
  section,
  schema,
  title,
  summary,
  endpoints,
}: CategoryProps) {
  React.useEffect(expanded);
  const { expand, onToggle } = useExpand(section, initialExpand);
  const headingRef = React.useRef<HTMLHeadingElement>(null);
  return (
    <section class="flex flex-col">
      <div>
        <prose.h2 id={section} ref={headingRef}>
          {title}
        </prose.h2>
      </div>
      <TwoColumnLayout
        left={<div class="mt-4">{summary}</div>}
        right={
          <div class="border-slate-3 bg-slate-1 flex flex-col gap-4 rounded-lg border p-4">
            {endpoints.map((endpoint) => {
              const { method, path, title, deprecated, unstable } = endpoint;
              const id = getEndpointRepr(endpoint);
              const href = `${basepath}/${section}#${encodeURIComponent(id)}`;
              return (
                <a
                  key={id}
                  href={href}
                  class={`hover:text-orange-5 text-slate-6 flex flex-col text-sm leading-tight underline-offset-4 transition-colors hover:underline ${
                    deprecated || unstable ? "opacity-50" : ""
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    expandAndScrollTo({ section, href, id });
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
                  href={`https://api.iamport.kr/#!/${section}/${operation.operationId}`}
                >
                  Swagger Test Link
                </a>
              </div>
            )}
          />
        ))}
      </Expand>
    </section>
  );
}
