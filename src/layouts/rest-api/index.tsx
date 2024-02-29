import * as React from "preact/compat";

import * as prose from "~/components/prose";
import { Categories } from "~/layouts/rest-api/category";
import { TypeDefinitions } from "~/layouts/rest-api/category/type-def";

import {
  getEveryEndpoints,
  groupEndpointsByCategory,
} from "./schema-utils/endpoint";

export interface RestApiProps {
  title: string;
  children?: React.ReactNode;
  basepath: string;
  apiHost: string;
  currentSection: string;
  sectionDescriptionProps: Record<string, React.ReactNode>;
  schema: unknown;
}
export default function RestApi({
  title,
  children,
  basepath,
  apiHost,
  currentSection,
  sectionDescriptionProps,
  schema,
}: RestApiProps) {
  React.useEffect(() => {
    if (location.hash) return;
    document
      .getElementById(currentSection)
      ?.scrollIntoView({ behavior: "smooth" });
  }, []);
  const everyEndpoints = getEveryEndpoints(schema);
  const endpointGroups = groupEndpointsByCategory(schema, everyEndpoints);
  return (
    <div class="flex flex-1 justify-center">
      <article class="m-4 mb-16 flex shrink-1 basis-300 flex-col pb-10 text-slate-700">
        <section id="overview" class="flex flex-col scroll-mt-5.2rem">
          <prose.h1>{title}</prose.h1>
          {children}
          <Hr />
        </section>
        <Categories
          basepath={basepath}
          apiHost={apiHost}
          currentSection={currentSection}
          sectionDescriptionProps={sectionDescriptionProps}
          endpointGroups={endpointGroups}
          schema={schema}
        />
        <TypeDefinitions
          basepath={basepath}
          initialExpand={currentSection === "type-def"}
          endpointGroups={endpointGroups}
          schema={schema}
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
