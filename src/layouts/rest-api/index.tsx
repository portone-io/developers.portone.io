import * as React from "react";
import * as prose from "~/components/prose";
import { Categories } from "~/layouts/rest-api/category";
import { TypeDefinitions } from "~/layouts/rest-api/category/type-def";

export interface RestApiProps {
  title: string;
  children?: any;
  basepath: string;
  apiHost: string;
  currentSection: string;
  sectionDescriptionProps: Record<string, any>;
  schema: any;
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
  return (
    <div class="flex flex-1 justify-center">
      <article class="basis-300 shrink-1 m-4 mb-16 flex flex-col pb-10 text-slate-700">
        <section id="overview" class="scroll-mt-5rem flex flex-col">
          <prose.h1>{title}</prose.h1>
          {children}
          <Hr />
        </section>
        <Categories
          basepath={basepath}
          apiHost={apiHost}
          currentSection={currentSection}
          sectionDescriptionProps={sectionDescriptionProps}
          schema={schema}
        />
        <TypeDefinitions
          basepath={basepath}
          initialExpand={currentSection === "type-def"}
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
