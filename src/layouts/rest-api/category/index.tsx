import { createMemo, For, type JSXElement, Show } from "solid-js";

import { prose } from "~/components/prose";
import { expandAndScrollTo, useExpand } from "~/state/rest-api/expand-section";

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
  sectionDescriptionProps: Record<string, () => JSXElement>;
  endpointGroups: CategoryEndpointsPair[];
  schema: unknown;
}
export function Categories(props: CategoriesProps) {
  return (
    <For each={props.endpointGroups}>
      {(group) => (
        <Category
          sectionDescriptionProps={props.sectionDescriptionProps}
          basepath={props.basepath}
          apiHost={props.apiHost}
          section={group.category.id}
          initialExpand={props.currentSection === group.category.id}
          schema={props.schema}
          title={group.category.title}
          description={group.category.description}
          endpoints={group.endpoints}
        />
      )}
    </For>
  );
}

export interface CategoryProps {
  sectionDescriptionProps: Record<string, () => JSXElement>;
  basepath: string;
  apiHost: string;
  initialExpand: boolean;
  alwaysExpand?: boolean;
  section: string;
  schema: unknown;
  title: string;
  description: string | undefined;
  endpoints: Endpoint[];
}
export function Category(props: CategoryProps) {
  const { expand, onToggle } = useExpand(
    props.section,
    () => props.initialExpand,
  );
  let headingRef: HTMLHeadingElement | undefined;
  const descriptionElement = () => (
    <SectionDescription
      section={props.section}
      sectionDescriptionProps={props.sectionDescriptionProps}
      description={props.description}
    />
  );

  const endpointList = () => (
    <For each={props.endpoints}>
      {(endpoint) => (
        <EndpointDoc
          basepath={props.basepath}
          schema={props.schema}
          endpoint={endpoint}
          renderRightFn={({ schema, endpoint, operation }) => (
            <EndpointPlayground
              apiHost={props.apiHost}
              schema={schema()}
              endpoint={endpoint()}
              operation={operation()}
            />
          )}
        />
      )}
    </For>
  );

  return (
    <section id={props.section} class="flex flex-col scroll-mt-5.2rem">
      <div>
        <prose.h2 ref={headingRef}>{props.title}</prose.h2>
      </div>
      <Show
        when={props.endpoints.length > 0}
        fallback={
          <>
            {descriptionElement()}
            <Hr />
          </>
        }
      >
        <TwoColumnLayout
          gap={6}
          left={descriptionElement}
          right={() => (
            <div class="mt-4 flex flex-col gap-4">
              <h3 class="text-slate-4 font-bold">목차</h3>
              <For each={props.endpoints}>
                {(endpoint) => {
                  const id = createMemo(() => getEndpointRepr(endpoint));
                  const href = createMemo(
                    () =>
                      `${props.basepath}/${props.section}#${encodeURIComponent(id())}`,
                  );
                  return (
                    <a
                      href={href()}
                      class="flex flex-col gap-1 text-sm text-slate-6 leading-tight underline-offset-4 transition-colors hover:text-orange-5"
                      classList={{
                        "opacity-50": endpoint.deprecated || endpoint.unstable,
                      }}
                      onClick={(e) => {
                        if (props.alwaysExpand) {
                          e.preventDefault();
                          document
                            .getElementById(id())
                            ?.scrollIntoView({ behavior: "smooth" });
                          history.replaceState({}, "", href());
                        } else {
                          e.preventDefault();
                          expandAndScrollTo({
                            section: props.section,
                            href: href(),
                            id: id(),
                          });
                        }
                      }}
                      data-norefresh
                    >
                      <div class="font-bold">{endpoint.title}</div>
                      <MethodLine
                        method={endpoint.method}
                        path={endpoint.path}
                      />
                    </a>
                  );
                }}
              </For>
            </div>
          )}
        />
        <Show
          when={props.alwaysExpand}
          fallback={
            <Expand
              class="my-20"
              title={props.title}
              expand={expand()}
              onToggle={onToggle}
              onCollapse={() => {
                headingRef?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              {endpointList()}
            </Expand>
          }
        >
          <div class="my-20 flex flex-col gap-20">{endpointList()}</div>
        </Show>
      </Show>
    </section>
  );
}

interface SectionDescriptionProps {
  section: string;
  sectionDescriptionProps: Record<string, () => JSXElement>;
  description: string | undefined;
}
function SectionDescription(props: SectionDescriptionProps) {
  const sectionDescription = createMemo(
    () => props.sectionDescriptionProps[props.section],
  );
  return (
    <Show
      when={sectionDescription()}
      fallback={<div class="mt-4" innerHTML={props.description} />}
    >
      <div class="mt-4">{sectionDescription()?.()}</div>
    </Show>
  );
}
