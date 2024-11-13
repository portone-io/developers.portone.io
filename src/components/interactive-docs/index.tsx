export { code } from "./code";

import {
  type Component,
  createEffect,
  createMemo,
  type ParentComponent,
  type ParentProps,
  Show,
  startTransition,
  untrack,
} from "solid-js";
import { match, P } from "ts-pattern";

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
  Condition: ParentComponent<{
    when?: (params: Params) => boolean;
    language?:
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
    props: ParentProps<{
      when?: (params: Params) => boolean;
      language?:
        | `frontend/${FrontendLanguage}`
        | `backend/${BackendLanguage}`
        | `hybrid/${HybridLanguage}`;
    }>,
  ) => {
    const { params, selectedLanguage } = useInteractiveDocs();
    const show = createMemo(() => {
      const whenResolver = (when: Required<typeof props>["when"]) =>
        when(params as Params);
      const languageResolver = (language: Required<typeof props>["language"]) =>
        match(selectedLanguage())
          .with(
            [P.string, P.string],
            ([frontend, backend]) =>
              `frontend/${frontend}` === language ||
              `backend/${backend}` === language,
          )
          .with(P.string, (hybrid) => `hybrid/${hybrid}` === language)
          .exhaustive();
      return (
        (props.when ? whenResolver(props.when) : true) &&
        (props.language ? languageResolver(props.language) : true)
      );
    });
    return (
      <Show when={show()}>
        <div>{props.children}</div>{" "}
      </Show>
    );
  };
  return {
    InteractiveDoc,
    Section,
    Condition,
  };
}
