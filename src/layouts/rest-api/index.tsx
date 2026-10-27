import { A } from "@solidjs/router";
import { For, type JSXElement } from "solid-js";

import { prose } from "~/components/prose";
import { Category } from "~/layouts/rest-api/category";
import { TypeDefinitions } from "~/layouts/rest-api/category/type-def";

import type { OverviewGroup } from "./__generated__";
import type { CategoryEndpointsPair } from "./schema-utils/endpoint";

export interface RestApiOverviewProps {
  title: string;
  children?: JSXElement;
  basepath: string;
  groups: OverviewGroup[];
}
export function RestApiOverview(props: RestApiOverviewProps) {
  return (
    <div class="flex flex-1 justify-center">
      <article class="m-4 mb-16 flex shrink-1 basis-300 flex-col pb-10 text-slate-7">
        <section id="overview" class="flex scroll-mt-[5.2rem] flex-col">
          <prose.h1>{props.title}</prose.h1>
          {props.children}
        </section>
        <Hr />
        <section class="flex flex-col gap-6">
          <prose.h2>API 카테고리</prose.h2>
          <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <For each={props.groups}>
              {(group) => (
                <div class="relative flex flex-col gap-2 rounded-lg border border-slate-2 p-4 transition-colors hover:border-orange-3 hover:bg-orange-50/30 has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-orange-3">
                  <A
                    href={`${props.basepath}/${group.category.id}`}
                    class="text-base font-bold text-slate-8 after:absolute after:inset-0 focus-visible:outline-none"
                  >
                    {group.category.title}
                  </A>
                  <div
                    class="line-clamp-2 text-sm text-slate-5"
                    innerHTML={group.category.description}
                  />
                  <div class="text-xs text-slate-4">
                    {group.endpointCount}개의 엔드포인트
                  </div>
                </div>
              )}
            </For>
          </div>
        </section>
      </article>
    </div>
  );
}

export interface RestApiCategoryProps {
  basepath: string;
  apiHost: string;
  currentSection: string;
  sectionDescriptionProps: Record<string, () => JSXElement>;
  group: CategoryEndpointsPair;
  schema: unknown;
}
export function RestApiCategory(props: RestApiCategoryProps) {
  return (
    <div class="flex flex-1 justify-center">
      <article class="m-4 mb-16 flex shrink-1 basis-300 flex-col pb-10 text-slate-7">
        <Category
          basepath={props.basepath}
          apiHost={props.apiHost}
          section={props.currentSection}
          schema={props.schema}
          title={props.group.category.title}
          description={props.group.category.description}
          endpoints={props.group.endpoints}
          sectionDescriptionProps={props.sectionDescriptionProps}
        />
        <TypeDefinitions
          basepath={props.basepath}
          endpointGroups={[props.group]}
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
