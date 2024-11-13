export { code } from "./code";

import {
  type Component,
  createEffect,
  type ParentComponent,
  type ParentProps,
  Show,
  startTransition,
  untrack,
} from "solid-js";

import {
  type CodeExample,
  type PgOptions,
  useInteractiveDocs,
} from "~/state/interactive-docs";

import type { DefaultParams } from "./code";
import type { CodePreviewProps } from "./CodePreview";

export type CodeExmapleMap<
  Params extends DefaultParams,
  Sections extends string,
  T extends string,
> = {
  [key in T]: CodeExample<Params, Sections>[];
};

export function createInteractiveDoc<
  Params extends DefaultParams,
  Sections extends string,
  FrontendLanguage extends string,
  BackendLanguage extends string,
  HybridLanguage extends string,
>({
  codeExamples,
  pgOptions,
  initialParams,
  initialSelectedExample,
  preview,
}: {
  codeExamples: {
    frontend: CodeExmapleMap<Params, Sections, FrontendLanguage>;
    backend: CodeExmapleMap<Params, Sections, BackendLanguage>;
    hybrid?: CodeExmapleMap<Params, Sections, HybridLanguage>;
  };
  pgOptions: PgOptions;
  initialParams: Params;
  initialSelectedExample:
    | [frontend: FrontendLanguage, backend: BackendLanguage]
    | HybridLanguage;
  preview: Component<CodePreviewProps>;
}): {
  InteractiveDoc: ParentComponent;
  Section: ParentComponent<{ section?: Sections }>;
  Condition: ParentComponent<{ when: (params: Params) => boolean }>;
  Language: ParentComponent<{
    language:
      | `frontend/${FrontendLanguage}`
      | `backend/${BackendLanguage}`
      | `hybrid/${HybridLanguage}`;
  }>;
} {
  const InteractiveDoc: ParentComponent = (props) => {
    const {
      setPgOptions,
      setLanguages,
      setParams,
      setCodeExamples,
      setSelectedLanguage,
      setPreview,
    } = useInteractiveDocs();
    void startTransition(() => {
      setPgOptions(pgOptions);
      setLanguages({
        frontend: Object.keys(codeExamples.frontend) as [
          FrontendLanguage,
          ...FrontendLanguage[],
        ],
        backend: Object.keys(codeExamples.backend) as [
          BackendLanguage,
          ...BackendLanguage[],
        ],
        hybrid: codeExamples.hybrid
          ? (Object.keys(codeExamples.hybrid) as [
              HybridLanguage,
              ...HybridLanguage[],
            ])
          : [],
      });
      setParams(initialParams);
      setCodeExamples(
        codeExamples as unknown as {
          frontend: Record<
            string,
            CodeExample<DefaultParams & object, string>[]
          >;
          backend: Record<
            string,
            CodeExample<DefaultParams & object, string>[]
          >;
          hybrid?: Record<
            string,
            CodeExample<DefaultParams & object, string>[]
          >;
        },
      );
      setSelectedLanguage(initialSelectedExample as [string, string] | string);
      setPreview(() => preview);
    });

    return <>{props.children}</>;
  };
  const Section = (props: ParentProps<{ section?: Sections }>) => {
    const { setCurrentSection, currentSection } = useInteractiveDocs();
    let ref: HTMLDivElement;
    createEffect(() => {
      if (props.section === currentSection()) {
        ref.dataset.active = "";
      } else {
        delete ref.dataset.active;
      }
    });
    const handleClick = () => {
      setCurrentSection(() => untrack(() => props.section) ?? null);
      ref.scrollBy();
    };
    return (
      <div
        ref={ref!}
        onClick={handleClick}
        class="cursor-pointer border-b border-l-5 border-white px-[19px] py-4 data-[active]:border-[#FC7D46] data-[active]:bg-[#FFF2EC] [&:not([data-active])]:hover:border-slate-2"
      >
        {props.children}
      </div>
    );
  };
  const Condition = (
    props: ParentProps<{ when: (params: Params) => boolean }>,
  ) => {
    const { params } = useInteractiveDocs();
    return (
      <Show when={props.when(params as Params)}>
        <div>{props.children}</div>{" "}
      </Show>
    );
  };
  const Language = (props: ParentProps) => <div>{props.children}</div>;
  return {
    InteractiveDoc,
    Section,
    Language,
    Condition,
  };
}
