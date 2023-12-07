import * as React from "react";
import * as prose from "~/components/prose";
import {
  expandAndScrollTo,
  expanded,
  useExpand,
} from "~/state/rest-api/expand-section";
import {
  type Endpoint,
  getEveryEndpoints,
  getEndpointRepr,
  groupEndpointsByCategory,
} from "../schema-utils/endpoint";
import TwoColumnLayout from "../TwoColumnLayout";
import Expand from "./Expand";
import { Hr } from "..";
import EndpointDoc, { MethodLine } from "../endpoint/EndpointDoc";
import EndpointPlayground from "../endpoint/playground/EndpointPlayground";

export interface CategoriesProps {
  basepath: string; // e.g. "/api/rest-v1"
  apiHost: string; // e.g. "https://api.iamport.kr"
  currentSection: string;
  schema: any;
}
export function Categories({
  schema,
  basepath,
  apiHost,
  currentSection,
}: CategoriesProps) {
  const everyEndpoints = getEveryEndpoints(schema);
  return (
    <>
      {groupEndpointsByCategory(schema, everyEndpoints).map(
        ({ category: { id, title, description }, endpoints }) => (
          <Category
            basepath={basepath}
            apiHost={apiHost}
            section={id}
            initialExpand={currentSection === id}
            schema={schema}
            title={title}
            description={description}
            endpoints={endpoints}
          />
        )
      )}
    </>
  );
}

export interface CategoryProps {
  basepath: string;
  apiHost: string;
  initialExpand: boolean;
  section: string;
  schema: any;
  title: string;
  description: any;
  endpoints: Endpoint[];
}
export function Category({
  basepath,
  apiHost,
  initialExpand,
  section,
  schema,
  title,
  description,
  endpoints,
}: CategoryProps) {
  React.useEffect(expanded);
  const { expand, onToggle } = useExpand(section, initialExpand);
  const headingRef = React.useRef<HTMLHeadingElement>(null);
  const descriptionElement = (
    <div
      class="mt-4"
      dangerouslySetInnerHTML={{
        __html: description,
      }}
    />
  );
  return (
    <section id={section} class="scroll-mt-5rem flex flex-col">
      <div>
        <prose.h2 ref={headingRef}>{title}</prose.h2>
      </div>
      {endpoints.length < 1 ? (
        <>
          {descriptionElement}
          <Hr />
        </>
      ) : (
        <>
          <TwoColumnLayout
            left={descriptionElement}
            right={
              <div class="mt-4 flex flex-col gap-4">
                <h3 class="text-slate-4 font-bold">목차</h3>
                {endpoints.map((endpoint) => {
                  const { method, path, title, deprecated, unstable } =
                    endpoint;
                  const id = getEndpointRepr(endpoint);
                  const href = `${basepath}/${section}#${encodeURIComponent(
                    id
                  )}`;
                  return (
                    <a
                      key={id}
                      href={href}
                      class={`hover:text-orange-5 text-slate-6 flex flex-col gap-1 text-sm leading-tight underline-offset-4 transition-colors ${
                        deprecated || unstable ? "opacity-50" : ""
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        expandAndScrollTo({ section, href, id });
                      }}
                      data-norefresh
                    >
                      <div class="font-bold">{title}</div>
                      <MethodLine method={method} path={path} />
                    </a>
                  );
                })}
              </div>
            }
          />
          <Expand
            className="my-20"
            title={title}
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
                renderRightFn={(props) => (
                  <EndpointPlayground apiHost={apiHost} {...props} />
                )}
              />
            ))}
          </Expand>
        </>
      )}
    </section>
  );
}
