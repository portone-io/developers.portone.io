import * as React from "preact/compat";

import * as prose from "~/components/prose";
import {
  expandAndScrollTo,
  expanded,
  useExpand,
} from "~/state/rest-api/expand-section";

import { Hr } from "..";
import EndpointDoc, { MethodLine } from "../endpoint/EndpointDoc";
import EndpointPlayground from "../endpoint/playground/EndpointPlayground";
import {
  type CategoryEndpointsPair,
  type Endpoint,
  getEndpointRepr,
} from "../schema-utils/endpoint";
import TwoColumnLayout from "../TwoColumnLayout";
import Expand from "./Expand";

export interface CategoriesProps {
  basepath: string; // e.g. "/api/rest-v1"
  apiHost: string; // e.g. "https://api.iamport.kr"
  currentSection: string;
  sectionDescriptionProps: Record<string, React.ReactNode>;
  endpointGroups: CategoryEndpointsPair[];
  schema: unknown;
}
export function Categories({
  schema,
  basepath,
  apiHost,
  currentSection,
  sectionDescriptionProps,
  endpointGroups,
}: CategoriesProps) {
  return (
    <>
      {endpointGroups.map(
        ({ category: { id, title, description }, endpoints }) => (
          <Category
            sectionDescriptionProps={sectionDescriptionProps}
            basepath={basepath}
            apiHost={apiHost}
            section={id}
            initialExpand={currentSection === id}
            schema={schema}
            title={title}
            description={description}
            endpoints={endpoints}
          />
        ),
      )}
    </>
  );
}

export interface CategoryProps {
  sectionDescriptionProps: Record<string, React.ReactNode>;
  basepath: string;
  apiHost: string;
  initialExpand: boolean;
  section: string;
  schema: unknown;
  title: string;
  description: string | undefined;
  endpoints: Endpoint[];
}
export function Category({
  sectionDescriptionProps,
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
    <SectionDescription
      section={section}
      sectionDescriptionProps={sectionDescriptionProps}
      description={description}
    />
  );
  return (
    <section id={section} class="flex flex-col scroll-mt-5.2rem">
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
            gap={6}
            left={descriptionElement}
            right={
              <div class="mt-4 flex flex-col gap-4">
                <h3 class="text-slate-4 font-bold">목차</h3>
                {endpoints.map((endpoint) => {
                  const { method, path, title, deprecated, unstable } =
                    endpoint;
                  const id = getEndpointRepr(endpoint);
                  const href = `${basepath}/${section}#${encodeURIComponent(
                    id,
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

interface SectionDescriptionProps {
  section: string;
  sectionDescriptionProps: Record<string, React.ReactNode>;
  description: string | undefined;
}
function SectionDescription({
  section,
  sectionDescriptionProps,
  description,
}: SectionDescriptionProps) {
  const sectionDescription = sectionDescriptionProps[section];
  if (sectionDescription) return <div class="mt-4">{sectionDescription}</div>;
  return (
    <div
      class="mt-4"
      dangerouslySetInnerHTML={{
        __html: description ?? "",
      }}
    />
  );
}
