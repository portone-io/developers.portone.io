import { createMemo, type JSXElement, onMount } from "solid-js";

import * as prose from "~/components/prose";
import { Categories } from "~/layouts/rest-api/category";
import { TypeDefinitions } from "~/layouts/rest-api/category/type-def";

import {
  getEveryEndpoints,
  groupEndpointsByCategory,
} from "./schema-utils/endpoint";

export interface RestApiProps {
  title: string;
  children?: JSXElement;
  basepath: string;
  apiHost: string;
  currentSection: string;
  sectionDescriptionProps: Record<string, () => JSXElement>;
  schema: unknown;
}
export default function RestApi(props: RestApiProps) {
  onMount(() => {
    const id = location.hash
      ? decodeURIComponent(location.hash.slice(1))
      : props.currentSection;
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  });
  const everyEndpoints = createMemo(() => getEveryEndpoints(props.schema));
  const endpointGroups = createMemo(() =>
    groupEndpointsByCategory(props.schema, everyEndpoints()),
  );
  return (
    <div class="flex flex-1 justify-center">
      <article class="m-4 mb-16 flex shrink-1 basis-300 flex-col pb-10 text-slate-7">
        <section id="overview" class="flex flex-col scroll-mt-5.2rem">
          <prose.h1>{props.title}</prose.h1>
          {props.children}
          <Hr />
        </section>
        <Categories
          basepath={props.basepath}
          apiHost={props.apiHost}
          currentSection={props.currentSection}
          sectionDescriptionProps={props.sectionDescriptionProps}
          endpointGroups={endpointGroups()}
          schema={props.schema}
        />
        <TypeDefinitions
          basepath={props.basepath}
          initialExpand={props.currentSection === "type-def"}
          endpointGroups={endpointGroups()}
          schema={props.schema}
        />
      </article>
    </div>
  );
}

export function Hr() {
  return <hr class="my-20" />;
}

export function interleave<T, U>(items: T[], joiner: U): (T | U)[] {
  const result: (T | U)[] = [];
  for (const item of items) result.push(item, joiner);
  result.pop();
  return result;
}
