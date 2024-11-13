import { createContextProvider } from "@solid-primitives/context";
import { createHighlighterCore } from "shiki/core";
import { createOnigurumaEngine } from "shiki/engine/oniguruma";
import { createEffect, createMemo, createSignal, untrack } from "solid-js";
import { createStore } from "solid-js/store";

import type { Code, Section } from "~/components/interactive-docs/code";
import { PgOptions } from "~/components/interactive-docs/PgSelect";

export type CodeExample<Params extends object, Sections extends string> = {
  fileName: string;
  code: Code<Params, Sections>;
};

export type Tab = {
  fileName: string;
  sections: Record<string, Section>;
  code: string;
};

export const highlighter = await createHighlighterCore({
  themes: [import("shiki/themes/one-dark-pro.mjs")],
  langs: [
    import("shiki/langs/javascript.mjs"),
    import("shiki/langs/html.mjs"),
    import("shiki/langs/css.mjs"),
    import("shiki/langs/json.mjs"),
    import("shiki/langs/jsx.mjs"),
  ],
  engine: createOnigurumaEngine(import("shiki/wasm")),
});

const [InteractiveDocsProvider, useInteractiveDocs] = createContextProvider(
  () => {
    const [pgOptions, setPgOptions] = createSignal<[PgOptions, ...PgOptions[]]>(
      Object.keys(PgOptions) as [PgOptions, ...PgOptions[]],
    );
    const [selectedPg, setSelectedPg] = createSignal<PgOptions>(pgOptions()[0]);
    createEffect(() => {
      setSelectedPg(pgOptions()[0]);
    });
    const [languages, setLanguages] = createSignal<{
      frontend: [string, ...string[]];
      backend: [string, ...string[]];
      hybrid: string[];
    }>({
      frontend: ["react", "html"],
      backend: ["node", "python"],
      hybrid: ["nextjs"],
    });
    const [selectedLanguage, setSelectedLanguage] = createSignal<
      [frontend: string, backend: string] | string
    >(["react", "node"]);
    createEffect(() => {
      setSelectedLanguage([languages().frontend[0], languages().backend[0]]);
    });
    const [params, setParams] = createStore<object>({});
    const [codeExamples, setCodeExamples] = createSignal<{
      frontend: Record<string, CodeExample<object, string>[]>;
      backend: Record<string, CodeExample<object, string>[]>;
      hybrid?: Record<string, CodeExample<object, string>[]>;
    }>({
      frontend: {},
      backend: {},
    });
    const tabs = createMemo<Tab[]>(() => {
      const resolveCode = (example: CodeExample<object, string>): Tab => {
        const { code, sections } = example.code(params);
        return {
          fileName: example.fileName,
          code,
          sections: sections as Record<string, Section>,
        };
      };
      const _selectedLanguage = selectedLanguage();
      if (_selectedLanguage === null) return [];
      if (Array.isArray(_selectedLanguage)) {
        const [frontend, backend] = _selectedLanguage;
        return [
          ...(codeExamples()["frontend"][frontend] ?? []),
          ...(codeExamples()["backend"][backend] ?? []),
        ].map(resolveCode);
      }
      const hybrid = codeExamples()["hybrid"];
      return hybrid ? (hybrid[_selectedLanguage] ?? []).map(resolveCode) : [];
    });
    const [selectedTab, setSelectedTab] = createSignal(tabs()[0] ?? null);
    const sections = createMemo<Record<string, { fileName: string } & Section>>(
      () => {
        const result = tabs().reduce(
          (acc, tab) => {
            for (const [
              section,
              { startLine, endLine },
            ] of Object.entries<Section>(tab.sections)) {
              if (section in acc) {
                console.error(
                  `Section "${section}" is defined in multiple files`,
                );
              }
              acc[section] = {
                fileName: tab.fileName,
                startLine,
                endLine,
              };
            }
            return acc;
          },
          {} as Record<string, { fileName: string } & Section>,
        );
        return result;
      },
    );
    const highlightSection = (section: string) => {
      if (!section) return;
      const _sections = untrack(() => sections());
      const sectionInfo = _sections[section];
      if (!sectionInfo) {
        console.error(`Section "${section}" is not defined`);
        return;
      }
    };

    return {
      pgOptions,
      setPgOptions,
      selectedPg,
      setSelectedPg,
      languages,
      setLanguages,
      selectedLanguage,
      setSelectedLanguage,
      params,
      setParams,
      setCodeExamples,
      sections,
      tabs,
      highlightSection,
      selectedTab,
      setSelectedTab,
    };
  },
  {
    pgOptions: () => Object.keys(PgOptions) as [PgOptions, ...PgOptions[]],
    setPgOptions: (_) => {},
    selectedPg: () => "inicis",
    setSelectedPg: (_) => {},
    languages: () => ({
      frontend: ["react", "html"],
      backend: ["node", "python"],
      hybrid: ["nextjs"],
    }),
    setLanguages: (_) => {},
    selectedLanguage: () => ["react", "node"],
    setSelectedLanguage: (_) => {},
    params: () => ({}),
    setParams: () => {},
    setCodeExamples: (_) => {},
    tabs: () => [],
    sections: () => ({}),
    highlightSection: (_) => {},
    selectedTab: () => null,
    setSelectedTab: (_) => {},
  },
);

export { InteractiveDocsProvider, useInteractiveDocs };
