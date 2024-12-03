import { createContextProvider } from "@solid-primitives/context";
import { createHighlighterCore } from "shiki/core";
import { createOnigurumaEngine } from "shiki/engine/oniguruma";
import {
  batch,
  type Component,
  createEffect,
  createMemo,
  createSignal,
  on,
  type Setter,
} from "solid-js";
import { createStore } from "solid-js/store";

import type {
  Code,
  DefaultParams,
  Section,
} from "~/components/interactive-docs/code";

export type CodeExample<
  Params extends DefaultParams,
  Sections extends string,
> = {
  fileName: string;
  code: Code<Params, Sections>;
};

export type Tab = {
  fileName: string;
  sections: Record<string, Section>;
  code: string;
};

export type PayMethod = "card" | "virtualAccount";
export type Pg =
  | "nice"
  | "smatro"
  | "toss"
  | "kpn"
  | "inicis"
  | "ksnet"
  | "kcp"
  | "kakao"
  | "naver"
  | "tosspay"
  | "hyphen";

export type ConvertToPgParam<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends Partial<Record<O, any>>,
  O extends Pg = Pg,
  KeyName extends string = "name",
  ValueName extends string = "payMethods",
> = {
  [K in keyof T]: {
    [P in KeyName]: K;
  } & {
    [M in ValueName]: T[K][ValueName][number];
  };
}[keyof T];

export type PgOptions = {
  [key in Pg]?: {
    payMethods: PayMethod[];
  };
};

const highlighterInstance = createHighlighterCore({
  themes: [import("shiki/themes/one-dark-pro.mjs")],
  langs: [
    import("shiki/langs/javascript.mjs"),
    import("shiki/langs/html.mjs"),
    import("shiki/langs/css.mjs"),
  ],
  engine: createOnigurumaEngine(import("shiki/wasm")),
});

type Params = DefaultParams & object;
export type InteractiveDocsInit = {
  pgOptions: PgOptions;
  languages: {
    frontend: [string, ...string[]];
    backend: [string, ...string[]];
    hybrid: string[];
  };
  params: DefaultParams & object;
};

const [InteractiveDocsProvider, useInteractiveDocs] = createContextProvider(
  (props: { initial?: InteractiveDocsInit }) => {
    const defaultInitial: InteractiveDocsInit = {
      pgOptions: {
        hyphen: { payMethods: ["card"] },
      },
      languages: {
        frontend: ["react"],
        backend: ["node"],
        hybrid: ["nextjs"],
      },
      params: {
        pg: {
          name: "hyphen",
          payMethods: "card",
        },
      },
    };
    const initial = createMemo(() => props.initial ?? defaultInitial);
    const [params, setParams] = createStore<Params>(initial().params);
    // initial 변경 시 DefaultParams 값 초기화
    createEffect(
      on(initial, (initial) => {
        setParams(initial.params);
      }),
    );

    const [preview, setPreview] = createSignal<Component | undefined>(
      undefined,
    );
    const pgName = createMemo(() => params.pg.name);
    const pgOptions = createMemo(() => initial().pgOptions);
    // PG사 변경 시 처리
    createEffect(
      on([pgName, pgOptions], ([pgName, pgOptions]) => {
        const pgOption = pgOptions[pgName];
        if (pgOption === undefined) {
          const firstPgName = Object.keys(pgOptions)[0];
          if (firstPgName) {
            setParams("pg", "name", firstPgName as Pg);
          }
        } else {
          const payMethod = pgOption.payMethods.find(
            (method) => method === params.pg.payMethods,
          );
          if (!payMethod && pgOption.payMethods[0]) {
            setParams("pg", "payMethods", pgOption.payMethods[0]);
          }
        }
      }),
    );

    const languages = createMemo(() => initial().languages);
    const [selectedLanguage, setSelectedLanguage] = createSignal<
      [frontend: string, backend: string] | string | null
    >([languages().frontend[0], languages().backend[0]]);
    // 언어 변경 시 처리
    createEffect(
      on([selectedLanguage, languages], ([selectedLanguage, languages]) => {
        if (selectedLanguage === null) return;
        if (Array.isArray(selectedLanguage)) {
          const [frontend, backend] = selectedLanguage;
          batch(() => {
            if (!languages.frontend.includes(frontend)) {
              setSelectedLanguage([languages.frontend[0], backend]);
            }
            if (!languages.backend.includes(backend)) {
              setSelectedLanguage([frontend, languages.backend[0]]);
            }
          });
        } else {
          if (!languages.hybrid.includes(selectedLanguage)) {
            setSelectedLanguage(
              languages.hybrid[0] ?? [
                languages.frontend[0],
                languages.backend[0],
              ],
            );
          }
        }
      }),
    );

    const [codeExamples, setCodeExamples] = createSignal<{
      frontend: Record<string, CodeExample<Params, string>[]>;
      backend: Record<string, CodeExample<Params, string>[]>;
      hybrid?: Record<string, CodeExample<Params, string>[]>;
    }>({
      frontend: {},
      backend: {},
    });
    const [tabs, setTabs] = createSignal<Tab[]>([]);
    createEffect(
      on(
        [selectedLanguage, codeExamples],
        ([selectedLanguage, codeExamples]) => {
          const resolveCode = (example: CodeExample<Params, string>): Tab => {
            const { code, sections } = example.code(params);
            return {
              fileName: example.fileName,
              code,
              sections: sections as Record<string, Section>,
            };
          };
          if (selectedLanguage === null) return [];
          if (Array.isArray(selectedLanguage)) {
            const [frontend, backend] = selectedLanguage;
            return setTabs(
              [
                ...(codeExamples["frontend"][frontend] ?? []),
                ...(codeExamples["backend"][backend] ?? []),
              ].map(resolveCode),
            );
          }
          const hybrid = codeExamples["hybrid"];
          return setTabs(
            hybrid ? (hybrid[selectedLanguage] ?? []).map(resolveCode) : [],
          );
        },
      ),
    );
    const [selectedTab, setSelectedTab] = createSignal<string | null>(
      tabs()[0]?.fileName ?? null,
    );
    createEffect(
      on([tabs, selectedTab], ([tabs, selectedTab]) => {
        const tab = tabs.find((tab) => tab.fileName === selectedTab);
        if (!tab) {
          setSelectedTab(tabs[0]?.fileName ?? null);
        }
      }),
    );
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
    const [currentSection, setCurrentSection] = createSignal<string | null>(
      null,
    );
    const highlightSection = createMemo<
      ({ fileName: string } & Section) | null
    >(() => {
      const section = currentSection();
      if (!section) return null;
      return sections()[section] ?? null;
    });
    // Section 변경 시 Tab 이동
    createEffect(
      on([highlightSection, tabs], ([section, tabs]) => {
        if (!section) return;
        const tab = tabs.find((tab) => tab.fileName === section.fileName);
        if (tab) {
          setSelectedTab(tab?.fileName);
        }
      }),
    );

    const [highlighter, setHighlighter] =
      createSignal<Awaited<ReturnType<typeof createHighlighterCore>>>();
    void highlighterInstance.then(setHighlighter);

    return {
      pgOptions,
      languages,
      selectedLanguage,
      setSelectedLanguage,
      params,
      setParams,
      setCodeExamples,
      sections,
      currentSection,
      setCurrentSection,
      tabs,
      selectedTab,
      setSelectedTab,
      highlighter,
      highlightSection,
      preview,
      setPreview,
    };
  },
  {
    pgOptions: () => ({
      inicis: {
        payMethods: ["card"],
      },
    }),
    languages: () => ({
      frontend: ["react", "html"],
      backend: ["node", "python"],
      hybrid: ["nextjs"],
    }),
    selectedLanguage: () => ["react", "node"],
    setSelectedLanguage: (_) => {},
    params: {
      pg: {
        name: "inicis",
        payMethods: "card",
      },
    },
    setParams: () => {},
    setCodeExamples: (_) => {},
    tabs: () => [],
    sections: () => ({}),
    currentSection: () => null,
    setCurrentSection: (_) => {},
    selectedTab: () => null,
    setSelectedTab: (_) => {},
    highlighter: () => undefined,
    highlightSection: () => null,
    preview: () => undefined,
    setPreview: ((_) => {}) as Setter<Component | undefined>,
  },
);

export { InteractiveDocsProvider, useInteractiveDocs };
