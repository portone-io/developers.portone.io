export { code } from "./code";

import { createContextProvider } from "@solid-primitives/context";
import {
  createMemo,
  createSignal,
  type ParentComponent,
  type ParentProps,
} from "solid-js";
import { createStore } from "solid-js/store";
import { Portal } from "solid-js/web";

import { useInteractiveDocs } from "~/state/interactive-docs";

import type { Code, Section } from "./code";
import type { PgOptions } from "./PgSelect";

export type CodeExample<Params extends object, Sections extends string> = {
  fileName: string;
  code: Code<Params, Sections>;
};

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
    | HybridLanguage
    | null;
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
  const [Provider, useProvider] = createContextProvider(() => {
    const [params, setParams] = createStore(initialParams);
    const [selectedExample, setSelectedExample] = createSignal<
      | [frontend: FrontendLanguage, backend: BackendLanguage]
      | HybridLanguage
      | null
    >(initialSelectedExample);
    const currentExamples = createMemo(() => {
      const resolveCode = (example: CodeExample<Params, Sections>) => ({
        fileName: example.fileName,
        ...example.code(params),
      });
      const examples = selectedExample();
      if (examples === null) return [];
      if (Array.isArray(examples)) {
        const [frontend, backend] = examples;
        return [
          ...codeExamples["frontend"][frontend],
          ...codeExamples["backend"][backend],
        ].map(resolveCode);
      }
      return codeExamples["hybrid"]
        ? codeExamples["hybrid"][examples].map(resolveCode)
        : [];
    });
    const sections = createMemo<
      Record<Sections, { fileName: string } & Section>
    >(() => {
      const examples = currentExamples();
      const result = examples.reduce(
        (acc, example) => {
          for (const [
            _section,
            { startLine, endLine },
          ] of Object.entries<Section>(
            example.sections as Record<Sections, Section>,
          )) {
            const section = _section as Sections;
            if (section in acc) {
              console.error(
                `Section "${section}" is defined in multiple examples`,
              );
            }
            acc[section] = {
              fileName: example.fileName,
              startLine,
              endLine,
            };
          }
          return acc;
        },
        {} as Record<Sections, { fileName: string } & Section>,
      );
      return result;
    });
    const highlightSection = (section: Sections | null) => {
      if (!section) return;
      const _sections = sections();
      const sectionInfo = _sections[section];
      if (!sectionInfo) {
        console.error(`Section "${section}" is not defined`);
        return;
      }
    };
    return {
      params,
      setParams,
      selectedExample,
      setSelectedExample,
      codeExamples,
      sections,
      highlightSection,
    };
  });
  const InteractiveDoc: ParentComponent = (props) => {
    const { setPgOptions, setLanguages } = useInteractiveDocs();
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
    return (
      <Provider>
        {props.children}
        <Portal mount={document.getElementById("docs-right-sidebar")!}>
          <div class="w-133">todo</div>
        </Portal>
      </Provider>
    );
  };
  const Section = (props: ParentProps<{ section: Sections }>) => {
    const { highlightSection } = useProvider()!;
    return (
      <div onClick={() => highlightSection(props.section)}>
        {props.children}
      </div>
    );
  };
  const Language = (props: ParentProps) => <div>{props.children}</div>;
  return {
    InteractiveDoc,
    Section,
    Language,
  };
}
