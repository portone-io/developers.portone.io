export { code } from "./code";

import {
  type ParentComponent,
  type ParentProps,
  startTransition,
} from "solid-js";

import { type CodeExample, useInteractiveDocs } from "~/state/interactive-docs";

import type { PgOptions } from "./PgSelect";

export type CodeExmapleMap<
  Params extends object,
  Sections extends string,
  T extends string,
> = {
  [key in T]: CodeExample<Params, Sections>[];
};

export function createInteractiveDoc<
  Params extends object,
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
  pgOptions: readonly [PgOptions, ...PgOptions[]];
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
      setPgOptions([...pgOptions]);
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
          frontend: Record<string, CodeExample<object, string>[]>;
          backend: Record<string, CodeExample<object, string>[]>;
          hybrid?: Record<string, CodeExample<object, string>[]>;
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
