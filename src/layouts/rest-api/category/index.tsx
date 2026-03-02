import {
  createMemo,
  createSignal,
  For,
  type JSXElement,
  onMount,
  Show,
} from "solid-js";

import { prose } from "~/components/prose";

import EndpointDoc from "../endpoint/EndpointDoc";
import EndpointPlayground from "../endpoint/playground/EndpointPlayground";
import {
  type CategoryEndpointsPair,
  type Endpoint,
  getEndpointRepr,
} from "../schema-utils/endpoint";

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
  section: string;
  schema: unknown;
  title: string;
  description: string | undefined;
  endpoints: Endpoint[];
}
export function Category(props: CategoryProps) {
  let headingRef: HTMLHeadingElement | undefined;
  const descriptionElement = () => (
    <SectionDescription
      section={props.section}
      sectionDescriptionProps={props.sectionDescriptionProps}
      description={props.description}
    />
  );

  const [openStates, setOpenStates] = createSignal<Record<string, boolean>>({});

  onMount(() => {
    const hash = window.location.hash;
    const hashId = hash ? decodeURIComponent(hash.slice(1)) : "";
    const initial: Record<string, boolean> = {};
    for (const endpoint of props.endpoints) {
      const id = getEndpointRepr(endpoint);
      initial[id] = id === hashId;
    }
    setOpenStates(initial);
  });

  const setEndpointOpen = (id: string, open: boolean) => {
    setOpenStates((prev) => ({ ...prev, [id]: open }));
  };

  const collapsibleEndpointList = () => (
    <For each={props.endpoints}>
      {(endpoint, index) => {
        const id = createMemo(() => getEndpointRepr(endpoint));
        return (
          <div
            class="flex flex-col"
            classList={{ "border-t border-slate-2 pt-4": index() > 0 }}
          >
            <EndpointDoc
              basepath={props.basepath}
              schema={props.schema}
              endpoint={endpoint}
              collapsible
              open={openStates()[id()]}
              onOpenChange={(open) => setEndpointOpen(id(), open)}
              renderRightFn={({ schema, endpoint, operation }) => (
                <EndpointPlayground
                  apiHost={props.apiHost}
                  schema={schema()}
                  endpoint={endpoint()}
                  operation={operation()}
                />
              )}
            />
          </div>
        );
      }}
    </For>
  );

  return (
    <section id={props.section} class="flex flex-col scroll-mt-5.2rem">
      <div>
        <prose.h2 ref={headingRef}>{props.title}</prose.h2>
      </div>
      {descriptionElement()}
      <div class="my-10 flex flex-col gap-4">{collapsibleEndpointList()}</div>
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
