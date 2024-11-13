export { code } from "./code";

import {
  type ParentComponent,
  type ParentProps,
  startTransition,
} from "solid-js";

import {
  type CodeExample,
  type PgOptions,
  useInteractiveDocs,
} from "~/state/interactive-docs";

import type { DefaultParams } from "./code";

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
}): {
  InteractiveDoc: ParentComponent;
  Section: ParentComponent<{ section: Sections }>;
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
    });

    return <>{props.children}</>;
  };
  const Section = (props: ParentProps<{ section: Sections }>) => {
    return <div>{props.children}</div>;
  };
  const Language = (props: ParentProps) => <div>{props.children}</div>;
  return {
    InteractiveDoc,
    Section,
    Language,
  };
}
