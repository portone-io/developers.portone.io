import { A, useNavigate } from "@solidjs/router";
import { createMemo, For, type JSXElement, onMount } from "solid-js";

import { prose } from "~/components/prose";
import { Categories, Category } from "~/layouts/rest-api/category";
import { TypeDefinitions } from "~/layouts/rest-api/category/type-def";

import { getCategories } from "./schema-utils/category";
import {
  type CategoryEndpointsPair,
  getEmptyCategoryIds,
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

export interface RestApiOverviewProps {
  title: string;
  children?: JSXElement;
  basepath: string;
  schema: unknown;
}
export function RestApiOverview(props: RestApiOverviewProps) {
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
        </section>
        <Hr />
        <section class="flex flex-col gap-6">
          <prose.h2>API 카테고리</prose.h2>
          <div class="grid gap-4 lg:grid-cols-3 md:grid-cols-2">
            <For each={endpointGroups().filter((g) => g.endpoints.length > 0)}>
              {(group) => (
                <A
                  href={`${props.basepath}/${group.category.id}`}
                  class="flex flex-col gap-2 border border-slate-2 rounded-lg p-4 transition-colors hover:border-orange-3 hover:bg-orange-50/30"
                >
                  <div class="text-base text-slate-8 font-bold">
                    {group.category.title}
                  </div>
                  <div
                    class="line-clamp-2 text-sm text-slate-5"
                    innerHTML={group.category.description}
                  />
                  <div class="text-xs text-slate-4">
                    {group.endpoints.length}개의 엔드포인트
                  </div>
                </A>
              )}
            </For>
          </div>
        </section>
      </article>
    </div>
  );
}

export interface RestApiCategoryProps {
  title: string;
  basepath: string;
  apiHost: string;
  currentSection: string;
  sectionDescriptionProps: Record<string, () => JSXElement>;
  schema: unknown;
}
export function RestApiCategory(props: RestApiCategoryProps) {
  const navigate = useNavigate();
  onMount(() => {
    const id = location.hash ? decodeURIComponent(location.hash.slice(1)) : "";
    if (id) {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
  });
  const everyEndpoints = createMemo(() => getEveryEndpoints(props.schema));
  const allEndpointGroups = createMemo(() =>
    groupEndpointsByCategory(props.schema, everyEndpoints()),
  );
  const currentGroup = createMemo(() =>
    allEndpointGroups().find(
      (group) => group.category.id === props.currentSection,
    ),
  );

  // 빈 카테고리인 경우 리다이렉트
  const isEmpty = createMemo(
    () => currentGroup() && currentGroup()!.endpoints.length === 0,
  );
  onMount(() => {
    if (!isEmpty()) return;
    const categories = getCategories(props.schema);
    const emptyIds = getEmptyCategoryIds(props.schema);
    const parent = categories.find((c) => c.id === props.currentSection);
    if (parent?.children && parent.children.length > 0) {
      const firstNonEmpty = parent.children.find((c) => !emptyIds.has(c.id));
      if (firstNonEmpty) {
        navigate(`${props.basepath}/${firstNonEmpty.id}`, { replace: true });
        return;
      }
    }
    navigate(`${props.basepath}/overview`, { replace: true });
  });

  const filteredEndpointGroups = createMemo((): CategoryEndpointsPair[] => {
    const group = currentGroup();
    return group ? [group] : [];
  });
  return (
    <div class="flex flex-1 justify-center">
      <article class="m-4 mb-16 flex shrink-1 basis-300 flex-col pb-10 text-slate-7">
        <Category
          basepath={props.basepath}
          apiHost={props.apiHost}
          section={props.currentSection}
          initialExpand={true}
          alwaysExpand={true}
          schema={props.schema}
          title={currentGroup()?.category.title ?? ""}
          description={currentGroup()?.category.description}
          endpoints={currentGroup()?.endpoints ?? []}
          sectionDescriptionProps={props.sectionDescriptionProps}
        />
        <TypeDefinitions
          basepath={props.basepath}
          initialExpand={false}
          endpointGroups={filteredEndpointGroups()}
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
